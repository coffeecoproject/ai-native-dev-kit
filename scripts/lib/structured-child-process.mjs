import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";

const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_OUTPUT_BYTES = 256 * 1024 * 1024;
const ERROR_PREVIEW_BYTES = 64 * 1024;

export function runStructuredJsonChildSync(options) {
  const command = options.command || process.execPath;
  const args = Array.isArray(options.args) ? options.args : [];
  const timeout = Number.isSafeInteger(options.timeout) && options.timeout > 0
    ? options.timeout
    : DEFAULT_TIMEOUT_MS;
  const maxOutputBytes = Number.isSafeInteger(options.maxOutputBytes) && options.maxOutputBytes > 0
    ? options.maxOutputBytes
    : DEFAULT_MAX_OUTPUT_BYTES;
  const tempDir = fs.mkdtempSync(path.join(options.tempRoot || os.tmpdir(), "intentos-json-child-"));
  const stdoutPath = path.join(tempDir, "stdout.json");
  const stderrPath = path.join(tempDir, "stderr.log");
  let stdoutFd;
  let stderrFd;

  try {
    stdoutFd = fs.openSync(stdoutPath, "w");
    stderrFd = fs.openSync(stderrPath, "w");
    const result = spawnSync(command, args, {
      cwd: options.cwd,
      env: options.env,
      timeout,
      killSignal: "SIGTERM",
      stdio: ["ignore", stdoutFd, stderrFd],
    });
    fs.closeSync(stdoutFd);
    fs.closeSync(stderrFd);
    stdoutFd = undefined;
    stderrFd = undefined;

    const stdoutBytes = fileSize(stdoutPath);
    const stderrBytes = fileSize(stderrPath);
    const stderrPreview = readPreview(stderrPath);
    const processFailure = classifyProcessFailure(result, timeout);
    if (processFailure) {
      return executionResult({
        state: processFailure.state,
        result,
        stdoutPath,
        stdoutBytes,
        stderrBytes,
        stderrPreview,
        error: processFailure.error || stderrPreview,
      });
    }
    if (stdoutBytes > maxOutputBytes) {
      return executionResult({
        state: "OUTPUT_LIMIT_EXCEEDED",
        result,
        stdoutPath,
        stdoutBytes,
        stderrBytes,
        stderrPreview,
        error: `structured child output is ${stdoutBytes} bytes; limit is ${maxOutputBytes} bytes`,
      });
    }

    const stdout = fs.readFileSync(stdoutPath, "utf8");
    try {
      const value = JSON.parse(stdout);
      return executionResult({
        state: "CURRENT_RUN",
        result,
        stdoutPath,
        stdoutBytes,
        stderrBytes,
        stderrPreview,
        value,
      });
    } catch (error) {
      return executionResult({
        state: "INVALID_JSON",
        result,
        stdoutPath,
        stdoutBytes,
        stderrBytes,
        stderrPreview,
        error: `invalid JSON: ${error.message}`,
      });
    }
  } finally {
    if (stdoutFd !== undefined) fs.closeSync(stdoutFd);
    if (stderrFd !== undefined) fs.closeSync(stderrFd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function classifyProcessFailure(result, timeout) {
  if (result.error?.code === "ETIMEDOUT") {
    return { state: "TIMED_OUT", error: `structured child exceeded ${timeout} ms` };
  }
  if (result.error) {
    return {
      state: "PROCESS_FAILED",
      error: `${result.error.code || result.error.name || "PROCESS_ERROR"}: ${result.error.message}`,
    };
  }
  if (result.signal) return { state: "PROCESS_SIGNALED", error: `structured child terminated by ${result.signal}` };
  if (result.status === null) return { state: "PROCESS_FAILED", error: "structured child returned no exit status" };
  return null;
}

function executionResult(input) {
  return {
    state: input.state,
    exitStatus: input.result.status,
    signal: input.result.signal || null,
    errorCode: input.result.error?.code || "",
    stdoutBytes: input.stdoutBytes,
    stdoutDigest: digestFile(input.stdoutPath),
    stderrBytes: input.stderrBytes,
    stderrPreview: input.stderrPreview,
    value: input.value ?? null,
    error: input.error || "",
  };
}

function fileSize(file) {
  try {
    return fs.statSync(file).size;
  } catch {
    return 0;
  }
}

function readPreview(file) {
  const size = fileSize(file);
  if (size === 0) return "";
  const length = Math.min(size, ERROR_PREVIEW_BYTES);
  const fd = fs.openSync(file, "r");
  try {
    const buffer = Buffer.alloc(length);
    fs.readSync(fd, buffer, 0, length, 0);
    return buffer.toString("utf8");
  } finally {
    fs.closeSync(fd);
  }
}

function digestFile(file) {
  const hash = crypto.createHash("sha256");
  let fd;
  try {
    fd = fs.openSync(file, "r");
    const buffer = Buffer.alloc(64 * 1024);
    let bytesRead;
    do {
      bytesRead = fs.readSync(fd, buffer, 0, buffer.length, null);
      if (bytesRead > 0) hash.update(buffer.subarray(0, bytesRead));
    } while (bytesRead > 0);
    return `sha256:${hash.digest("hex")}`;
  } catch {
    return `sha256:${crypto.createHash("sha256").update("").digest("hex")}`;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}
