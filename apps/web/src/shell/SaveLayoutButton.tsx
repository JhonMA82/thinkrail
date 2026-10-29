import { RiSaveLine as Save } from "@remixicon/react";
import { t as translate, useT } from "@thinkrail/locales/react";
import { Button } from "@thinkrail/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@thinkrail/ui/popover";
import { IconTooltip } from "@thinkrail/ui/tooltip";
import { useRef, useState } from "react";
import { randomId } from "../lib";
import { toast, useAppStore } from "../store";
import { errorText, getTransport } from "../transport";
import { captureWorkbenchPreset } from "./layout";

const MAX_CUSTOM_PRESETS = 32;

export function SaveLayoutButton() {
	const t = useT();
	const frame = useAppStore((state) => state.workbenchFrame);
	const customLayoutPresets = useAppStore((state) => state.customLayoutPresets);
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [saving, setSaving] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const limitReached = customLayoutPresets.length >= MAX_CUSTOM_PRESETS;
	const disabled = !frame || limitReached || saving;
	const tooltip = limitReached
		? t("workbench.layoutSettings.customLimit", { limit: MAX_CUSTOM_PRESETS })
		: t("shell.topbar.saveLayout");

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				if (disabled && next) return;
				setOpen(next);
				if (next) setName("");
			}}
		>
			<IconTooltip label={tooltip} wrapTrigger>
				<PopoverTrigger
					type="button"
					data-testid="save-layout"
					aria-label={tooltip}
					disabled={disabled}
					title={limitReached ? tooltip : undefined}
					className="flex size-28 items-center justify-center rounded-sm text-text-muted outline-none transition-colors hover:bg-control-bg-hovered hover:text-text-default focus-visible:ring-2 focus-visible:ring-primary disabled:text-control-disabled-text"
				>
					<Save className="size-16" />
				</PopoverTrigger>
			</IconTooltip>
			<PopoverContent
				align="end"
				className="w-280 p-12"
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					inputRef.current?.focus();
				}}
			>
				<form
					data-testid="save-layout-form"
					onSubmit={(event) => {
						event.preventDefault();
						if (!frame || !name.trim() || saving || limitReached) return;
						setSaving(true);
						const preset = captureWorkbenchPreset(frame, randomId("preset"), name.trim());
						getTransport()
							.request("settings.update", {
								config: { customLayoutPresets: [...customLayoutPresets, preset] },
							})
							.then(() => {
								setName("");
								setOpen(false);
								toast.success(t("workbench.layoutSettings.saved", { name: preset.name }));
							})
							.catch((error) => {
								toast.error(errorText(error), translate("workbench.layoutSettings.saveFailed"));
							})
							.finally(() => setSaving(false));
					}}
					className="flex flex-col gap-12"
				>
					<input
						ref={inputRef}
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder={t("workbench.layoutSettings.namePlaceholder")}
						aria-label={t("workbench.layoutSettings.nameLabel")}
						maxLength={200}
						className="w-full rounded-sm border border-control-border-default bg-control-bg px-8 py-4 tr-text-ui text-text-default outline-none placeholder:text-text-subtle focus:border-control-border-active"
					/>
					<div className="flex justify-end gap-8">
						<Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
							{t("common.cancel")}
						</Button>
						<Button
							type="submit"
							variant="default"
							size="sm"
							aria-label={t("workbench.layoutSettings.savePreset")}
							disabled={!name.trim() || saving}
						>
							{t("common.save")}
						</Button>
					</div>
				</form>
			</PopoverContent>
		</Popover>
	);
}
