import { createTool } from '@mastra/core/tools';
import z from 'zod';
import { Daytona } from '@daytonaio/sdk';

async function getDaytona() {
  return new Daytona();
}

export const createSandbox = createTool({
  id: 'createSandbox',
  description: 'Create a Daytona sandbox',
  inputSchema: z.object({
    metadata: z.record(z.string()).optional(),
    envs: z.record(z.string()).optional(),
    timeoutMS: z.number().optional(),
    language: z.enum(['python', 'typescript']).optional(),
    name: z.string().optional(),
  }),
  outputSchema: z
    .object({
      sandboxId: z.string(),
    })
    .or(z.object({ error: z.string() })),
  execute: async ({ context }) => {
    try {
      const daytona = await getDaytona();
      const sandbox = await daytona.create({
        name: context?.name,
        language: context?.language,
      });
      return { sandboxId: sandbox.id };
    } catch (e) {
      return { error: JSON.stringify(e) };
    }
  },
});

export const runCode = createTool({
  id: 'runCode',
  description: 'Run code in a Daytona sandbox',
  inputSchema: z.object({
    sandboxId: z.string(),
    code: z.string(),
    runCodeOpts: z
      .object({
        language: z.enum(['ts', 'js', 'python']).default('python'),
        envs: z.record(z.string()).optional(),
        timeoutMS: z.number().optional(),
        requestTimeoutMs: z.number().optional(),
      })
      .optional(),
  }),
  outputSchema: z
    .object({ execution: z.string() })
    .or(z.object({ error: z.string() })),
  execute: async ({ context }) => {
    try {
      const daytona = await getDaytona();
      const sandbox = await daytona.get(context.sandboxId);
      const env = context.runCodeOpts?.envs;
      const timeoutMs = context.runCodeOpts?.timeoutMS;
      const res = await sandbox.process.codeRun(
        context.code,
        env ? { env } : undefined,
        timeoutMs ? Math.ceil(timeoutMs / 1000) : undefined,
      );
      return { execution: JSON.stringify(res) };
    } catch (e) {
      return { error: JSON.stringify(e) };
    }
  },
});

export const readFile = createTool({
  id: 'readFile',
  description: 'Read a file from the Daytona sandbox',
  inputSchema: z.object({ sandboxId: z.string(), path: z.string() }),
  outputSchema: z
    .object({ content: z.string(), path: z.string() })
    .or(z.object({ error: z.string() })),
  execute: async ({ context }) => {
    try {
      const daytona = await getDaytona();
      const sandbox = await daytona.get(context.sandboxId);
      const buf = await sandbox.fs.downloadFile(context.path);
      return { content: buf.toString('utf-8'), path: context.path };
    } catch (e) {
      return { error: JSON.stringify(e) };
    }
  },
});

export const writeFile = createTool({
  id: 'writeFile',
  description: 'Write a single file to the Daytona sandbox',
  inputSchema: z.object({ sandboxId: z.string(), path: z.string(), content: z.string() }),
  outputSchema: z
    .object({ success: z.boolean(), path: z.string() })
    .or(z.object({ error: z.string() })),
  execute: async ({ context }) => {
    try {
      const daytona = await getDaytona();
      const sandbox = await daytona.get(context.sandboxId);
      await sandbox.fs.uploadFile(Buffer.from(context.content, 'utf-8'), context.path);
      return { success: true, path: context.path };
    } catch (e) {
      return { error: JSON.stringify(e) };
    }
  },
});

export const writeFiles = createTool({
  id: 'writeFiles',
  description: 'Write multiple files to the Daytona sandbox',
  inputSchema: z.object({
    sandboxId: z.string(),
    files: z.array(z.object({ path: z.string(), data: z.string() })),
  }),
  outputSchema: z
    .object({ success: z.boolean(), filesWritten: z.array(z.string()) })
    .or(z.object({ error: z.string() })),
  execute: async ({ context }) => {
    try {
      const daytona = await getDaytona();
      const sandbox = await daytona.get(context.sandboxId);
      await sandbox.fs.uploadFiles(
        context.files.map(f => ({ source: Buffer.from(f.data, 'utf-8'), destination: f.path })),
      );
      return { success: true, filesWritten: context.files.map(f => f.path) };
    } catch (e) {
      return { error: JSON.stringify(e) };
    }
  },
});

export const listFiles = createTool({
  id: 'listFiles',
  description: 'List files and directories in a Daytona sandbox path',
  inputSchema: z.object({ sandboxId: z.string(), path: z.string().default('/') }),
  outputSchema: z
    .object({
      files: z.array(
        z.object({ name: z.string(), path: z.string(), isDirectory: z.boolean() }),
      ),
      path: z.string(),
    })
    .or(z.object({ error: z.string() })),
  execute: async ({ context }) => {
    try {
      const daytona = await getDaytona();
      const sandbox = await daytona.get(context.sandboxId);
      const files = await sandbox.fs.listFiles(context.path);
      return {
        files: files.map(f => ({
          name: f.name,
          path: context.path.endsWith('/') ? `${context.path}${f.name}` : `${context.path}/${f.name}`,
          isDirectory: !!f.isDir,
        })),
        path: context.path,
      };
    } catch (e) {
      return { error: JSON.stringify(e) };
    }
  },
});

export const deleteFile = createTool({
  id: 'deleteFile',
  description: 'Delete a file or directory in the Daytona sandbox',
  inputSchema: z.object({ sandboxId: z.string(), path: z.string() }),
  outputSchema: z
    .object({ success: z.boolean(), path: z.string() })
    .or(z.object({ error: z.string() })),
  execute: async ({ context }) => {
    try {
      const daytona = await getDaytona();
      const sandbox = await daytona.get(context.sandboxId);
      await sandbox.fs.deleteFile(context.path);
      return { success: true, path: context.path };
    } catch (e) {
      return { error: JSON.stringify(e) };
    }
  },
});

export const createDirectory = createTool({
  id: 'createDirectory',
  description: 'Create a directory in the Daytona sandbox',
  inputSchema: z.object({ sandboxId: z.string(), path: z.string() }),
  outputSchema: z
    .object({ success: z.boolean(), path: z.string() })
    .or(z.object({ error: z.string() })),
  execute: async ({ context }) => {
    try {
      const daytona = await getDaytona();
      const sandbox = await daytona.get(context.sandboxId);
      await sandbox.fs.createFolder(context.path, '755');
      return { success: true, path: context.path };
    } catch (e) {
      return { error: JSON.stringify(e) };
    }
  },
});

export const getFileInfo = createTool({
  id: 'getFileInfo',
  description: 'Get detailed information about a file or directory in Daytona sandbox',
  inputSchema: z.object({ sandboxId: z.string(), path: z.string() }),
  outputSchema: z
    .object({
      name: z.string(),
      type: z.enum(['file', 'dir']).optional(),
      path: z.string(),
      size: z.number(),
      mode: z.number().optional(),
      permissions: z.string().optional(),
      owner: z.string().optional(),
      group: z.string().optional(),
      modifiedTime: z.string().optional(),
      symlinkTarget: z.string().optional(),
    })
    .or(z.object({ error: z.string() })),
  execute: async ({ context }) => {
    try {
      const daytona = await getDaytona();
      const sandbox = await daytona.get(context.sandboxId);
      const info = await sandbox.fs.getFileDetails(context.path);
      return {
        name: info.name,
        type: (info.isDir ? 'dir' : 'file') as 'dir' | 'file',
        path: context.path,
        size: info.size ?? 0,
        permissions: info.permissions,
        modifiedTime: info.modTime,
      };
    } catch (e) {
      return { error: JSON.stringify(e) };
    }
  },
});

export const checkFileExists = createTool({
  id: 'checkFileExists',
  description: 'Check if a file or directory exists in the Daytona sandbox',
  inputSchema: z.object({ sandboxId: z.string(), path: z.string() }),
  outputSchema: z
    .object({ exists: z.boolean(), path: z.string(), type: z.enum(['file', 'dir']).optional() })
    .or(z.object({ error: z.string() })),
  execute: async ({ context }) => {
    try {
      const daytona = await getDaytona();
      const sandbox = await daytona.get(context.sandboxId);
      try {
        const info = await sandbox.fs.getFileDetails(context.path);
        return { exists: true, path: context.path, type: (info.isDir ? 'dir' : 'file') as 'dir' | 'file' };
      } catch {
        return { exists: false, path: context.path };
      }
    } catch (e) {
      return { error: JSON.stringify(e) };
    }
  },
});

export const getFileSize = createTool({
  id: 'getFileSize',
  description: 'Get the size of a file or directory in the Daytona sandbox',
  inputSchema: z.object({ sandboxId: z.string(), path: z.string(), humanReadable: z.boolean().default(false) }),
  outputSchema: z
    .object({ size: z.number(), humanReadableSize: z.string().optional(), path: z.string(), type: z.enum(['file', 'dir']).optional() })
    .or(z.object({ error: z.string() })),
  execute: async ({ context }) => {
    try {
      const daytona = await getDaytona();
      const sandbox = await daytona.get(context.sandboxId);
      const info = await sandbox.fs.getFileDetails(context.path);
      let humanReadableSize: string | undefined;
      if (context.humanReadable) {
        const bytes = info.size ?? 0;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) humanReadableSize = '0 B';
        else {
          const i = Math.floor(Math.log(bytes) / Math.log(1024));
          const size = (bytes / Math.pow(1024, i)).toFixed(1);
          humanReadableSize = `${size} ${sizes[i]}`;
        }
      }
      return { size: info.size ?? 0, humanReadableSize, path: context.path, type: (info.isDir ? 'dir' : 'file') as 'dir' | 'file' };
    } catch (e) {
      return { error: JSON.stringify(e) };
    }
  },
});

export const watchDirectory = createTool({
  id: 'watchDirectory',
  description: 'Watch a directory for changes in the Daytona sandbox (polling-based)',
  inputSchema: z.object({
    sandboxId: z.string(),
    path: z.string(),
    recursive: z.boolean().default(false),
    watchDuration: z.number().default(30000),
  }),
  outputSchema: z
    .object({
      watchStarted: z.boolean(),
      path: z.string(),
      events: z.array(
        z.object({ type: z.enum(['CREATE', 'DELETE']), name: z.string(), timestamp: z.string() }),
      ),
    })
    .or(z.object({ error: z.string() })),
  execute: async ({ context }) => {
    try {
      const daytona = await getDaytona();
      const sandbox = await daytona.get(context.sandboxId);
      const list = async () => await sandbox.fs.listFiles(context.path);
      const snapshot1 = await list();
      await new Promise(resolve => setTimeout(resolve, context.watchDuration));
      const snapshot2 = await list();
      const names1 = new Set(snapshot1.map(f => f.name));
      const names2 = new Set(snapshot2.map(f => f.name));
      const events: Array<{ type: 'CREATE' | 'DELETE'; name: string; timestamp: string }> = [];
      for (const n of names2) if (!names1.has(n)) events.push({ type: 'CREATE', name: n, timestamp: new Date().toISOString() });
      for (const n of names1) if (!names2.has(n)) events.push({ type: 'DELETE', name: n, timestamp: new Date().toISOString() });
      return { watchStarted: true, path: context.path, events };
    } catch (e) {
      return { error: JSON.stringify(e) };
    }
  },
});

export const runCommand = createTool({
  id: 'runCommand',
  description: 'Run a shell command in the Daytona sandbox',
  inputSchema: z.object({
    sandboxId: z.string(),
    command: z.string(),
    workingDirectory: z.string().optional(),
    timeoutMs: z.number().default(30000),
    captureOutput: z.boolean().default(true),
  }),
  outputSchema: z
    .object({
      success: z.boolean(),
      exitCode: z.number(),
      stdout: z.string(),
      stderr: z.string(),
      command: z.string(),
      executionTime: z.number(),
    })
    .or(z.object({ error: z.string() })),
  execute: async ({ context }) => {
    try {
      const daytona = await getDaytona();
      const sandbox = await daytona.get(context.sandboxId);
      const start = Date.now();
      const timeoutSec = context.timeoutMs ? Math.ceil(context.timeoutMs / 1000) : undefined;
      const res = await sandbox.process.executeCommand(
        context.command,
        context.workingDirectory,
        undefined,
        timeoutSec,
      );
      const executionTime = Date.now() - start;
      const anyRes = res as any;
      const stdout = (anyRes?.stdout ?? anyRes?.result ?? '') as string;
      const stderr = (anyRes?.stderr ?? '') as string;
      return {
        success: (res.exitCode ?? 0) === 0,
        exitCode: res.exitCode ?? 0,
        stdout,
        stderr,
        command: context.command,
        executionTime,
      };
    } catch (e) {
      return { error: JSON.stringify(e) };
    }
  },
});


export const createSession = createTool({
  id: 'createSession',
  description: 'Create a background process session in the Daytona sandbox',
  inputSchema: z.object({
    sandboxId: z.string(),
    sessionId: z.string().describe('Identifier for the session'),
  }),
  outputSchema: z
    .object({ success: z.boolean(), sessionId: z.string() })
    .or(z.object({ error: z.string() })),
  execute: async ({ context }) => {
    try {
      const daytona = await getDaytona();
      const sandbox = await daytona.get(context.sandboxId);
      await sandbox.process.createSession(context.sessionId);
      return { success: true, sessionId: context.sessionId };
    } catch (e) {
      return { error: JSON.stringify(e) };
    }
  },
});

export const executeSessionCommand = createTool({
  id: 'executeSessionCommand',
  description: 'Execute a command in a background session (optionally async)',
  inputSchema: z.object({
    sandboxId: z.string(),
    sessionId: z.string(),
    command: z.string(),
    runAsync: z.boolean().default(true),
  }),
  outputSchema: z
    .object({
      cmdId: z.string().optional(),
      stdout: z.string().optional(),
      stderr: z.string().optional(),
      exitCode: z.number().optional(),
    })
    .or(z.object({ error: z.string() })),
  execute: async ({ context }) => {
    try {
      const daytona = await getDaytona();
      const sandbox = await daytona.get(context.sandboxId);
      const res = await sandbox.process.executeSessionCommand(context.sessionId, {
        command: context.command,
        runAsync: context.runAsync,
      } as any);
      const anyRes = res as any;
      return {
        cmdId: anyRes?.cmdId,
        stdout: anyRes?.stdout,
        stderr: anyRes?.stderr,
        exitCode: anyRes?.exitCode,
      };
    } catch (e) {
      return { error: JSON.stringify(e) };
    }
  },
});

export const getPreviewLink = createTool({
  id: 'getPreviewLink',
  description: 'Get a public preview URL for a port in the Daytona sandbox',
  inputSchema: z.object({
    sandboxId: z.string(),
    port: z.number().describe('Port your HTTP server listens on'),
    checkServer: z.boolean().optional(),
    description: z.string().optional(),
  }),
  outputSchema: z
    .object({ url: z.string(), token: z.string().optional() })
    .or(z.object({ error: z.string() })),
  execute: async ({ context }) => {
    try {
      const daytona = await getDaytona();
      const sandbox = await daytona.get(context.sandboxId);
      const info = await sandbox.getPreviewLink(context.port);
      return { url: (info as any).url, token: (info as any).token };
    } catch (e) {
      return { error: JSON.stringify(e) };
    }
  },
});

export const startHttpService = createTool({
  id: 'startHttpService',
  description: 'Start an HTTP server in a background session and return the preview URL',
  inputSchema: z.object({
    sandboxId: z.string(),
    command: z.string().describe('Command to start the HTTP server (non-blocking preferred)'),
    port: z.number(),
    sessionId: z.string().optional(),
  }),
  outputSchema: z
    .object({
      sessionId: z.string(),
      cmdId: z.string().optional(),
      previewUrl: z.string(),
      previewToken: z.string().optional(),
    })
    .or(z.object({ error: z.string() })),
  execute: async ({ context }) => {
    try {
      const daytona = await getDaytona();
      const sandbox = await daytona.get(context.sandboxId);
      const sessionId = context.sessionId || `svc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      await sandbox.process.createSession(sessionId);
      const cmd = await sandbox.process.executeSessionCommand(sessionId, {
        command: context.command,
        runAsync: true,
      } as any);
      const preview = await sandbox.getPreviewLink(context.port);
      return {
        sessionId,
        cmdId: (cmd as any)?.cmdId,
        previewUrl: (preview as any).url,
        previewToken: (preview as any).token,
      };
    } catch (e) {
      return { error: JSON.stringify(e) };
    }
  },
});


