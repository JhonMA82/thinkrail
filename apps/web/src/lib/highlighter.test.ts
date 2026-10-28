import { expect, test } from "bun:test";
import { chatShikiLanguageId, SHIKI_FILE_LANGUAGES, shikiLanguageId } from "./highlighter";

test("the Monaco Shiki language registration list has no duplicate ids", () => {
	const ids = SHIKI_FILE_LANGUAGES.map((language) => language.id);
	expect(new Set(ids).size).toBe(ids.length);
});

test("a justfile answers its canonical language by id, alias and fence name", () => {
	expect(shikiLanguageId("just")).toBe("just");
	expect(shikiLanguageId("Just")).toBe("just");
	expect(chatShikiLanguageId("justfile")).toBe("just");
	expect(chatShikiLanguageId("mermaid")).toBeNull();
});

test("every Monaco language id is supplied by its Shiki grammar", async () => {
	const modules = await Promise.all(SHIKI_FILE_LANGUAGES.map((language) => language.load()));
	for (const [index, language] of SHIKI_FILE_LANGUAGES.entries()) {
		expect(
			modules[index]?.default.some((registration) => registration.name === language.id),
			language.id,
		).toBe(true);
	}
});
