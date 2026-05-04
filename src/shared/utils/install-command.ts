export type InstallCommandPlatform = 'macosLinux' | 'windows';

export interface InstallCommandConfig {
  installCommand?: string;
  installCommands?: Partial<Record<InstallCommandPlatform | 'darwin' | 'linux' | 'macos' | 'mac' | 'win', string>>;
}

export type ResolvedInstallCommands = Record<InstallCommandPlatform, string>;

export const DEFAULT_INSTALL_COMMANDS: ResolvedInstallCommands = {
  macosLinux: 'curl -fsSL https://code.xhyovo.cn/install | sh',
  windows: 'irm https://code.xhyovo.cn/install.ps1 | iex',
};

const trim = (value?: string) => (value || '').trim();

export function hasConfiguredInstallCommand(config?: InstallCommandConfig | null): boolean {
  if (!config) return false;
  if (trim(config.installCommand)) return true;
  return Object.values(config.installCommands || {}).some((value) => trim(value));
}

export function resolveInstallCommands(config?: InstallCommandConfig | null): ResolvedInstallCommands {
  const configured = config?.installCommands || {};
  const macosLinux =
    trim(configured.macosLinux) ||
    trim(configured.darwin) ||
    trim(configured.linux) ||
    trim(configured.macos) ||
    trim(configured.mac) ||
    trim(config?.installCommand) ||
    DEFAULT_INSTALL_COMMANDS.macosLinux;
  const windows =
    trim(configured.windows) ||
    trim(configured.win) ||
    DEFAULT_INSTALL_COMMANDS.windows;

  return { macosLinux, windows };
}

export function detectInstallCommandPlatform(): InstallCommandPlatform {
  if (typeof navigator === 'undefined') {
    return 'macosLinux';
  }
  const platform = `${navigator.platform || ''} ${navigator.userAgent || ''}`.toLowerCase();
  return platform.includes('win') ? 'windows' : 'macosLinux';
}

export function getInstallCommandPlatformLabel(platform: InstallCommandPlatform): string {
  return platform === 'windows' ? 'Windows' : 'macOS / Linux';
}
