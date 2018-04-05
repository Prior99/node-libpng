const path = require("path");
const fs = require("fs");
const request = require("request");
const fileName = require("./file-name");

if (fs.existsSync(fileName.qualifiedName)) { return; }
if (process.env["SKIP_BINARY_DOWNLOAD_FOR_CI"]) { return; }

// Get the version of the library;
const pkg = require(path.resolve(__dirname, "..", "package.json"));
const packageVersion = pkg.version;
const url = `https://github.com/Prior99/node-libpng/releases/download/${packageVersion}/${fileName.baseName}`;

console.info(`Downloading node-libpng prebuilt binary from "${url}".`);

const destination = fs.createWriteStream(fileName.qualifiedName);

request.get(url)
    .on("error", err => { throw err; })
    .on("response", response => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
            response.pipe(destination);
            destination.on("finish", () => {
                console.info("Successfully downloaded binaries for node-libpng.");
            });
            return;
        }
        if (response.statusCode === 404) {
            throw new Error(`No supported node-libpng ${packageVersion} build found for node ${process.version} on ${process.platform} (${process.arch}).`);
        } else {
            throw new Error(`Error downloading binaries for node-libpng ${packageVersion}. Received status code ${response.statusCode}`)
        }
        destination.close();
        fs.unlink(fileName.qualifiedName);
    });
