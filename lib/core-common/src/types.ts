import type ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import type { Options as TelejsonOptions } from 'telejson';
import type { PluginOptions } from '@storybook/react-docgen-typescript-plugin';
import { Configuration, Stats } from 'webpack';
import { TransformOptions } from '@babel/core';
import { Router } from 'express';
import { FileSystemCache } from 'file-system-cache';
import { Server } from 'http';

/**
 * ⚠️ This file contains internal WIP types they MUST NOT be exported outside this package for now!
 */

export interface TypescriptConfig {
  check: boolean;
  reactDocgen: false | string;
  reactDocgenTypescriptOptions: {
    shouldExtractLiteralValuesFromEnum: boolean;
    shouldRemoveUndefinedFromOptional: boolean;
    propFilter: (prop: any) => boolean;
  };
}

export interface CoreConfig {
  builder: 'webpack4' | 'webpack5';
  disableWebpackDefaults?: boolean;
  channelOptions?: Partial<TelejsonOptions>;
}

export interface Presets {
  apply(
    extension: 'typescript',
    config: TypescriptConfig,
    args?: Options
  ): Promise<TypescriptConfig>;
  apply(extension: 'babel', config: {}, args: any): Promise<TransformOptions>;
  apply(extension: 'entries', config: [], args: any): Promise<unknown>;
  apply(extension: 'stories', config: [], args: any): Promise<StoriesEntry[]>;
  apply(
    extension: 'webpack',
    config: {},
    args: { babelOptions?: TransformOptions } & any
  ): Promise<Configuration>;
  apply(extension: 'managerEntries', config: [], args: any): Promise<string[]>;
  apply(extension: 'refs', config: [], args: any): Promise<unknown>;
  apply(extension: 'core', config: {}, args: any): Promise<CoreConfig>;
  apply(
    extension: 'managerWebpack',
    config: {},
    args: Options & { babelOptions?: TransformOptions } & ManagerWebpackOptions
  ): Promise<Configuration>;
  apply<T extends unknown>(extension: string, config?: T, args?: unknown): Promise<T>;
}

export interface LoadedPreset {
  name: string;
  preset: any;
  options: any;
}

export interface PresetsOptions {
  corePresets: string[];
  overridePresets: string[];
  frameworkPresets: string[];
}

export type PresetConfig =
  | string
  | {
      name: string;
      options?: unknown;
    };

export interface Ref {
  id: string;
  url: string;
  title: string;
  version: string;
  type?: string;
}

export interface VersionCheck {
  success: boolean;
  data?: any;
  error?: any;
  time: number;
}

export interface ReleaseNotesData {
  success: boolean;
  currentVersion: string;
  showOnFirstLaunch: boolean;
}

export interface BuilderResult {
  stats?: Stats;
  totalTime?: ReturnType<typeof process.hrtime>;
}

// TODO: this is a generic interface that we can share across multiple SB packages (like @storybook/cli)
export interface PackageJson {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

// TODO: This could be exported to the outside world and used in `options.ts` file of each `@storybook/APP`
// like it's described in docs/api/new-frameworks.md
export interface LoadOptions {
  packageJson: PackageJson;
  framework: string;
  frameworkPresets: string[];
  outputDir?: string;
  configDir?: string;
  ignorePreview?: boolean;
  extendServer?: (server: Server) => void;
}

export interface ManagerWebpackOptions {
  entries: string[];
  refs: Record<string, Ref>;
}

export interface CLIOptions {
  port?: number;
  ignorePreview?: boolean;
  previewUrl?: string;
  forceBuildPreview?: boolean;
  host?: string;
  staticDir?: string[];
  configDir?: string;
  https?: boolean;
  sslCa?: string[];
  sslCert?: string;
  sslKey?: string;
  smokeTest?: boolean;
  managerCache?: boolean;
  open?: boolean;
  ci?: boolean;
  loglevel?: string;
  quiet?: boolean;
  versionUpdates?: boolean;
  releaseNotes?: boolean;
  dll?: boolean;
  docs?: boolean;
  docsDll?: boolean;
  uiDll?: boolean;
  debugWebpack?: boolean;
  webpackStatsJson?: string | boolean;
  outputDir?: string;
  modern?: boolean;
}

export interface BuilderOptions {
  configType?: 'DEVELOPMENT' | 'PRODUCTION';
  ignorePreview: boolean;
  cache: FileSystemCache;
  configDir: string;
  docsMode: boolean;
  features?: StorybookConfig['features'];
  versionCheck?: VersionCheck;
  releaseNotesData?: ReleaseNotesData;
  disableWebpackDefaults?: boolean;
}

export interface StorybookConfigOptions {
  presets: Presets;
  presetsList?: LoadedPreset[];
}

export type Options = LoadOptions & StorybookConfigOptions & CLIOptions & BuilderOptions;

export interface Builder<Config, Stats> {
  getConfig: (options: Options) => Promise<Config>;
  start: (args: {
    options: Options;
    startTime: ReturnType<typeof process.hrtime>;
    router: Router;
    server: Server;
  }) => Promise<void | {
    stats: Stats;
    totalTime: ReturnType<typeof process.hrtime>;
    bail: (e?: Error) => Promise<void>;
  }>;
  build: (arg: {
    options: Options;
    startTime: ReturnType<typeof process.hrtime>;
  }) => Promise<void | Stats>;
  bail: (e?: Error) => Promise<void>;
  corePresets?: string[];
  overridePresets?: string[];
}

/**
 * Options for TypeScript usage within Storybook.
 */
export interface TypescriptOptions {
  /**
   * Enables type checking within Storybook.
   *
   * @default `false`
   */
  check: boolean;
  /**
   * Configures `fork-ts-checker-webpack-plugin`
   */
  checkOptions?: ForkTsCheckerWebpackPlugin['options'];
  /**
   * Sets the type of Docgen when working with React and TypeScript
   *
   * @default `'react-docgen-typescript'`
   */
  reactDocgen: 'react-docgen-typescript' | 'react-docgen' | false;
  /**
   * Configures `react-docgen-typescript-plugin`
   *
   * @default
   * @see https://github.com/storybookjs/storybook/blob/next/lib/builder-webpack5/src/config/defaults.js#L4-L6
   */
  reactDocgenTypescriptOptions: PluginOptions;
}

interface StoriesSpecifier {
  /**
   * When auto-titling, what to prefix all generated titles with (default: '')
   */
  titlePrefix?: string;
  /**
   * Where to start looking for story files
   */
  directory: string;
  /**
   * What does the filename of a story file look like?
   * (a glob, relative to directory, no leading `./`)
   * If unset, we use `** / *.stories.@(mdx|tsx|ts|jsx|js)` (no spaces)
   */
  files?: string;
}

export type StoriesEntry = string | StoriesSpecifier;

export type NormalizedStoriesSpecifier = Required<StoriesSpecifier> & {
  /*
   * Match the "importPath" of a file (e.g. `./src/button/Button.stories.js')
   * relative to the current working directory.
   */
  importPathMatcher: RegExp;
};

export type Preset =
  | string
  | {
      name: string;
      options?: any;
    };

/**
 * An additional script that gets injected into the
 * preview or the manager,
 */
export type Entry = string;

type StorybookRefs = Record<string, {
  title: string;
  url: string;
}>;

/**
 * The interface for Storybook configuration in `main.ts` files.
 */
export interface StorybookConfig {
  /**
   * Sets the addons you want to use with Storybook.
   *
   * @example `['@storybook/addon-essentials']` or `[{ name: '@storybook/addon-essentials', options: { backgrounds: false } }]`
   */
  addons?: Preset[];
  core?: CoreConfig;
  logLevel?: string;
  features?: {
    /**
     * Allows to disable deprecated implicit PostCSS loader.
     */
    postcss?: boolean;

    /**
     * Build stories.json automatically on start/build
     */
    buildStoriesJson?: boolean;

    /**
     * Activate preview of CSF v3.0
     *
     * @deprecated This is always on now from 6.4 regardless of the setting
     */
    previewCsfV3?: boolean;

    /**
     * Activate modern inline rendering
     */
    modernInlineRender?: boolean;

    /**
     * Activate on demand story store
     */
    storyStoreV7?: boolean;

    /**
     * Enable a set of planned breaking changes for SB7.0
     */
    breakingChangesV7?: boolean;

    /**
     * Use Storybook 7.0 babel config scheme
     */
    babelModeV7?: boolean;
  };

  /**
   * Tells Storybook where to find stories.
   *
   * @example `['./src/*.stories.@(j|t)sx?']`
   */
  stories: StoriesEntry[];

  /**
   * Framework, e.g. '@storybook/react', required in v7
   */
  framework?: Preset;

  /**
   * Controls how Storybook handles TypeScript files.
   */
  typescript?: Partial<TypescriptOptions>;

  /**
   * References external Storybooks
   */
  refs?: StorybookRefs | ((config: Configuration, options: Options) => StorybookRefs)

  /**
   * Modify or return a custom Webpack config.
   */
  webpackFinal?: (
    config: Configuration,
    options: Options
  ) => Configuration | Promise<Configuration>;

  /**
   * Add additional scripts to run in the preview a la `.storybook/preview.js`
   */
  config?: (entries: Entry[], options: Options) => Entry[];
}
