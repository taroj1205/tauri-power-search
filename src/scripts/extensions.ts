import fs from "node:fs/promises";
import path from "node:path";
import { getExtensions } from "../utils/extensions";

const generateExtensionJSON = async () => {
	try {
		const extensions = await getExtensions();
		const publicDir = path.join(__dirname, "../assets");
		const filePath = path.join(publicDir, "extensions.json");

		await fs.mkdir(publicDir, { recursive: true });
		await fs.writeFile(filePath, JSON.stringify(extensions, null, 2), "utf-8");

		console.log("extensions.json generated successfully in public folder");
	} catch (error) {
		console.error("Error generating extensions.json:", error);
	}
};

generateExtensionJSON();
