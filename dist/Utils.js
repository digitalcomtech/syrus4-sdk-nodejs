"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.$sleep = exports.$throw = exports.$to = exports.$trycatch = exports.getPrefix = exports.uploadFile = exports.execute = exports.OSExecute = exports.getShell = void 0;
/**
 * Utils module some utlities in ApexOS
 * @module Utils
 */
const child_process_1 = require("child_process");
const os_1 = require("os");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ssh2_1 = require("ssh2");
let { APP_DATA_FOLDER } = process.env;
let { SYRUS4G_REMOTE, SYRUS4G_APP_NAME } = process.env;
const USERNAME = (0, os_1.userInfo)().username;
var __shell_promise;
async function getShell() {
    if (__shell_promise)
        return await __shell_promise;
    const { SYRUS4G_REMOTE_SSH_HOST, SYRUS4G_REMOTE_SSH_PORT, SYRUS4G_REMOTE_SSH_USERNAME, SYRUS4G_REMOTE_SSH_PW } = process.env;
    console.log("setting up remote shell", {
        SYRUS4G_REMOTE_SSH_HOST,
        SYRUS4G_REMOTE_SSH_PORT,
        SYRUS4G_REMOTE_SSH_USERNAME,
        SYRUS4G_REMOTE_SSH_PW: "*".repeat(SYRUS4G_REMOTE_SSH_PW.length)
    });
    __shell_promise = new Promise((resolve, reject) => {
        let conn = new ssh2_1.Client();
        let timeout = setTimeout(reject, 1000 * 20);
        conn.on('ready', () => {
            clearTimeout(timeout);
            console.log('ssh:ready', arguments);
            resolve(conn);
        });
        conn.on('close', () => {
            console.error('ssh:close', arguments);
            __shell_promise = null;
        });
        conn.on('end', () => {
            console.error('ssh:end', arguments);
            __shell_promise = null;
        });
        conn.on('error', (error) => {
            clearTimeout(timeout);
            console.error('ssh:error', error);
            reject(error);
        });
        conn.connect({
            host: SYRUS4G_REMOTE_SSH_HOST,
            port: parseInt(SYRUS4G_REMOTE_SSH_PORT),
            username: SYRUS4G_REMOTE_SSH_USERNAME,
            password: SYRUS4G_REMOTE_SSH_PW,
        });
    });
    return __shell_promise;
}
exports.getShell = getShell;
// TODO: !important remove the root check and uid settings
/**
 * Execute a command using sudo in the shell of the APEXOS and returns a promise with the stdout. Promise is rejected if status code is different than 0
 * @param args arguments to pass to the function to execute
 */
async function OSExecute(...args) {
    let retry = null;
    if (args[0].startsWith('$retry')) {
        retry = args.shift();
    }
    let command = args.map((x) => (x != null ? x.trim() : "")).join(" ");
    let opts = { timeout: 60000 * 10, maxBuffer: 1024 * 1024 * 5 };
    if (command.startsWith("apx-"))
        command = `sudo ${command}`;
    if (SYRUS4G_REMOTE) {
        let shell = await getShell();
        return new Promise((resolve, reject) => {
            // console.info("ssh:command", command)
            shell.exec(command, (error, stream) => {
                if (error) {
                    if (error.reason == 'CONNECT_FAILED' && !retry) {
                        $sleep(2 * 1000).then(() => {
                            OSExecute("$retry", command).then(resolve).catch(reject);
                        });
                        return;
                    }
                    // console.error("ssh:command", {command, error})
                    reject({
                        command,
                        error
                    });
                    return;
                }
                let stdouts = [];
                let stderrs = [];
                stream.on('data', (data) => {
                    stdouts.push(data);
                });
                stream.stderr.on('data', (data) => {
                    stderrs.push(data);
                });
                stream.on('close', (code, signal) => {
                    let data, response;
                    if (code != 0) {
                        response = {
                            error,
                            code,
                            signal,
                            errorText: Buffer.concat(stderrs).toString(),
                            output: Buffer.concat(stdouts).toString(),
                            command,
                        };
                        // console.error("ssh:command", response)
                        reject(response);
                        return;
                    }
                    try {
                        data = Buffer.concat(stdouts).toString();
                        resolve(JSON.parse(data));
                    }
                    catch (error) {
                        resolve(data);
                    }
                    // console.log("ssh:command", {command, response: data})
                });
            });
        });
    }
    return new Promise((resolve, reject) => {
        if (USERNAME != "syrus4g")
            opts.uid = 1000;
        (0, child_process_1.exec)(command, opts, (error, stdout, stderr) => {
            if (error || stderr) {
                reject({
                    command,
                    error,
                    errorText: stderr.toString(),
                    output: stdout.toString(),
                });
            }
            try {
                var data = stdout.toString();
                resolve(JSON.parse(data));
            }
            catch (error) {
                resolve(data);
            }
        });
    });
}
exports.OSExecute = OSExecute;
exports.execute = OSExecute;
async function uploadFile(path, content) {
    if (!SYRUS4G_REMOTE) {
        fs.writeFileSync(path, content);
        return;
    }
    let shell = await getShell();
    return new Promise(function (resolve, reject) {
        shell.sftp(function (err, sftp) {
            if (err) {
                console.log("shell.sftp");
                reject(err);
            }
            sftp.writeFile(path, content, function (err) {
                if (err) {
                    console.log("sftp.writeFile");
                    reject(err);
                }
                resolve({ path });
            });
        });
    });
}
exports.uploadFile = uploadFile;
/**
 * Fetch application prefix,
 * uses env=SYRUS4G_APP_NAME when available
 * otherwise it builds it from the directory where the app is running
 * @return {*}
 */
function getPrefix() {
    // Use environment name if available
    if (SYRUS4G_APP_NAME)
        return SYRUS4G_APP_NAME;
    // determine from APP_DATA_FOLDER if available
    if (APP_DATA_FOLDER === null || APP_DATA_FOLDER === void 0 ? void 0 : APP_DATA_FOLDER.length) {
        return APP_DATA_FOLDER.split(path.sep).pop();
    }
    // determine from current running directory
    var arr = (0, child_process_1.execSync)("pwd")
        .toString()
        .replace("\n", "")
        .split("node_modules/")[0]
        .split("/");
    arr.pop();
    SYRUS4G_APP_NAME = arr.pop();
    console.log("application prefix:", SYRUS4G_APP_NAME);
    return SYRUS4G_APP_NAME;
}
exports.getPrefix = getPrefix;
/**
 * Utility for try/catching promises in one line, avoiding the need for try/catch blocks
 * let [response, error] = $trycatch(await awaitable())
 * @param {Promise<any>} promise
 * @return {*}  {(Promise<[ any | null, Error | null ]>)}
 */
async function $trycatch(promise) {
    try {
        let result = await promise;
        return [result, null];
    }
    catch (error) {
        console.error(error);
        return [null, error];
    }
}
exports.$trycatch = $trycatch;
// easier to use alias to $trycatch
exports.$to = $trycatch;
/**
 * Utility for throwing errors inside a catch, reduces need for try/catch
 * await awaitable().catch($throw)
 * @param {Error} error
 */
function $throw(error) { throw error; }
exports.$throw = $throw;
/**
 * Sleep Utility
 * await $sleep(10*1000)
 * @param {number} ms
 * @return {*}  {Promise<void>}
 */
function $sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}
exports.$sleep = $sleep;
