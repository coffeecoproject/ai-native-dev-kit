import fs from "node:fs";
import path from "node:path";

export const canonicalBaselineLevels = [
  "BL0_LIGHTWEIGHT",
  "BL1_STANDARD",
  "BL2_INDUSTRIAL",
];

const starterProfiles = {
  "codex-web-app": ["web-app"],
  "codex-ios-app": ["ios-app"],
  "codex-android-app": ["android-app"],
};

const primaryPlatformProfiles = new Set([
  "web-app",
  "ios-app",
  "android-app",
  "wechat-miniprogram",
]);

const baselineLevelRank = new Map(canonicalBaselineLevels.map((level, index) => [level, index]));

const industrialPackForProfile = {
  "web-app": "web-app-industrial",
  "ios-app": "ios-app-industrial",
  "android-app": "android-app-industrial",
  "wechat-miniprogram": "wechat-miniprogram-industrial",
  "backend-api": "backend-api-industrial",
  "internal-admin": "internal-admin-industrial",
};

const projectScanIgnoredDirectories = new Set([
  ".git",
  ".hg",
  ".svn",
  ".intentos",
  ".next",
  ".nuxt",
  ".output",
  ".turbo",
  ".venv",
  "apply-execution-plans",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "target",
  "vendor",
]);

const realWorldConsentPatterns = [
  /\bexternal(?:\s+side)?\s+effect\b/i,
  /\bproduction\b/i,
  /\bdeploy(?:ment)?\b/i,
  /\bpublish(?:ing)?\b/i,
  /\brelease\b/i,
  /\bapp\s*signing\b/i,
  /\bstore\s+submission\b/i,
  /\bpayments?\b/i,
  /\bpaid\b/i,
  /\bbilling\b/i,
  /\bcharges?\b/i,
  /\brefunds?\b/i,
  /\bpayouts?\b/i,
  /\bvalue\s+transfer\b/i,
  /\bbalance\b/i,
  /\bcredit\b/i,
  /\bfinancial\s+risk\b/i,
  /\birreversible\b/i,
  /\bdestructive\b/i,
  /\bdata\s+deletion\b/i,
  /\bdelete\s+all\b/i,
  /\breal[- ]user\s+(?:message|communication)\b/i,
  /\bsubscription\s+message\b/i,
  /\bexternal\s+(?:provider|account)\b/i,
];

export class BaselineSelectionError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "BaselineSelectionError";
    this.code = code;
    this.details = details;
  }
}

function selectionError(code, message, details = {}) {
  return new BaselineSelectionError(code, message, details);
}

export function requiresRealWorldConsent(value) {
  const normalized = String(value || "").replace(/[-_/]+/g, " ").trim();
  return normalized.length > 0 && realWorldConsentPatterns.some((pattern) => pattern.test(normalized));
}

function inspectionIssue(code, file, message) {
  return {
    code,
    path: file,
    message,
  };
}

function readJsonEvidence(file, projectRoot, issues) {
  const relative = path.relative(projectRoot, file).replaceAll(path.sep, "/") || path.basename(file);
  let stat;
  try {
    stat = fs.lstatSync(file);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    issues.push(inspectionIssue("PROJECT_EVIDENCE_JSON_READ_FAILED", relative, `${relative} could not be inspected: ${error.message}`));
    return null;
  }
  try {
    if (!stat.isFile()) {
      issues.push(inspectionIssue("PROJECT_EVIDENCE_NOT_FILE", relative, `${relative} is not a regular file`));
      return null;
    }
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    issues.push(inspectionIssue("PROJECT_EVIDENCE_JSON_READ_FAILED", relative, `${relative} could not be read as JSON: ${error.message}`));
    return null;
  }
}

function readTextEvidence(file, projectRoot, issues, maxBytes = 512 * 1024) {
  const relative = path.relative(projectRoot, file).replaceAll(path.sep, "/") || path.basename(file);
  let stat;
  try {
    stat = fs.lstatSync(file);
  } catch (error) {
    if (error.code === "ENOENT") return "";
    issues.push(inspectionIssue("PROJECT_EVIDENCE_READ_FAILED", relative, `${relative} could not be inspected: ${error.message}`));
    return "";
  }
  try {
    if (!stat.isFile()) {
      issues.push(inspectionIssue("PROJECT_EVIDENCE_NOT_FILE", relative, `${relative} is not a regular file`));
      return "";
    }
    if (stat.size > maxBytes) {
      issues.push(inspectionIssue(
        "PROJECT_EVIDENCE_FILE_TOO_LARGE",
        relative,
        `${relative} exceeds the ${maxBytes}-byte project-evidence read limit`,
      ));
      return "";
    }
    return fs.readFileSync(file, "utf8");
  } catch (error) {
    issues.push(inspectionIssue("PROJECT_EVIDENCE_READ_FAILED", relative, `${relative} could not be read: ${error.message}`));
    return "";
  }
}

function readProjectTextSamples(projectRoot, entries, issues, pattern, options = {}) {
  const maxFiles = Number.isInteger(options.maxFiles) && options.maxFiles > 0 ? options.maxFiles : 32;
  const maxBytes = Number.isInteger(options.maxBytes) && options.maxBytes > 0
    ? options.maxBytes
    : 512 * 1024;
  return entries
    .filter((entry) => entry.type === "file" && pattern.test(entry.path))
    .sort((left, right) => left.path.localeCompare(right.path))
    .slice(0, maxFiles)
    .map((entry) => [
      `FILE: ${entry.path}`,
      readTextEvidence(path.join(projectRoot, entry.path), projectRoot, issues, maxBytes),
    ].join("\n"))
    .join("\n");
}

function scanProjectEntries(projectRoot, maxDepth = Number.POSITIVE_INFINITY, maxEntries = 5000) {
  const entries = [];
  const issues = [];
  let truncated = false;
  let entryLimitReached = false;
  let depthLimitReached = false;
  if (!projectRoot) return { entries, issues, truncated };
  let rootStat;
  try {
    rootStat = fs.lstatSync(projectRoot);
  } catch (error) {
    if (error.code === "ENOENT") return { entries, issues, truncated };
    issues.push(inspectionIssue("PROJECT_SCAN_ROOT_READ_FAILED", ".", `project root could not be inspected: ${error.message}`));
    return { entries, issues, truncated };
  }
  if (!rootStat.isDirectory()) {
    issues.push(inspectionIssue("PROJECT_SCAN_ROOT_NOT_DIRECTORY", ".", "project root is not a directory"));
    return { entries, issues, truncated };
  }

  function visit(directory, depth) {
    if (entries.length >= maxEntries) {
      truncated = true;
      entryLimitReached = true;
      return;
    }
    let children;
    try {
      children = fs.readdirSync(directory, { withFileTypes: true });
    } catch (error) {
      const relative = path.relative(projectRoot, directory).replaceAll(path.sep, "/") || ".";
      issues.push(inspectionIssue("PROJECT_SCAN_DIRECTORY_READ_FAILED", relative, `${relative} could not be scanned: ${error.message}`));
      return;
    }
    for (const child of children) {
      if (entries.length >= maxEntries) {
        truncated = true;
        entryLimitReached = true;
        return;
      }
      if (child.isSymbolicLink()) continue;
      if (child.isDirectory() && projectScanIgnoredDirectories.has(child.name)) continue;
      const full = path.join(directory, child.name);
      const relativePath = path.relative(projectRoot, full).replaceAll(path.sep, "/");
      entries.push({ path: relativePath, type: child.isDirectory() ? "directory" : "file" });
      if (child.isDirectory() && depth < maxDepth) {
        visit(full, depth + 1);
      } else if (child.isDirectory()) {
        truncated = true;
        depthLimitReached = true;
      }
    }
  }

  visit(projectRoot, 0);
  if (truncated) {
    issues.push(inspectionIssue(
      "PROJECT_SCAN_TRUNCATED",
      ".",
      `project scan did not complete (${[
        entryLimitReached ? `${maxEntries}-entry limit reached` : null,
        depthLimitReached ? `${maxDepth}-level depth limit reached` : null,
      ].filter(Boolean).join("; ")})`,
    ));
  }
  return { entries, issues, truncated };
}

function dependencyNames(packageJson) {
  return new Set(Object.keys({
    ...(packageJson?.dependencies || {}),
    ...(packageJson?.devDependencies || {}),
    ...(packageJson?.optionalDependencies || {}),
    ...(packageJson?.peerDependencies || {}),
  }).map((name) => name.toLowerCase()));
}

function hasAnyDependency(dependencies, names) {
  return names.some((name) => dependencies.has(name));
}

export function deriveProfilesFromProjectEvidence(projectRoot, options = {}) {
  const requestedRoot = String(projectRoot || "").trim();
  if (!requestedRoot) {
    return {
      projectRoot: null,
      projectState: "NOT_PROVIDED",
      technicalStatus: "NO_PROJECT_EVIDENCE",
      profiles: [],
      profileSignals: [],
      nonProfileSignals: [],
      inspectedEntries: 0,
      truncated: false,
      inspectionStatus: "NOT_RUN",
      inspectionIssues: [],
    };
  }

  const root = path.resolve(requestedRoot);
  const scan = scanProjectEntries(
    root,
    Number.isInteger(options.maxDepth) && options.maxDepth >= 0
      ? options.maxDepth
      : Number.POSITIVE_INFINITY,
    Number.isInteger(options.maxEntries) && options.maxEntries > 0 ? options.maxEntries : 5000,
  );
  const entries = scan.entries;
  const inspectionIssues = [...scan.issues];
  const paths = entries.map((entry) => entry.path);
  const pathSet = new Set(paths);
  const hasPath = (pattern) => paths.some((entry) => pattern.test(entry));
  const packageJson = readJsonEvidence(path.join(root, "package.json"), root, inspectionIssues);
  const dependencies = dependencyNames(packageJson);
  const pyprojectText = readTextEvidence(path.join(root, "pyproject.toml"), root, inspectionIssues);
  const cargoText = readTextEvidence(path.join(root, "Cargo.toml"), root, inspectionIssues);
  const goModText = readTextEvidence(path.join(root, "go.mod"), root, inspectionIssues);
  const pomText = readTextEvidence(path.join(root, "pom.xml"), root, inspectionIssues);
  const packageSwiftText = readTextEvidence(path.join(root, "Package.swift"), root, inspectionIssues);
  const pubspecText = readTextEvidence(path.join(root, "pubspec.yaml"), root, inspectionIssues);
  const gradleText = readProjectTextSamples(
    root,
    entries,
    inspectionIssues,
    /(?:^|\/)(?:build|settings)\.gradle(?:\.kts)?$/i,
    { maxFiles: 32, maxBytes: 1024 * 1024 },
  );
  const xcodeProjectText = readProjectTextSamples(
    root,
    entries,
    inspectionIssues,
    /(?:^|\/)project\.pbxproj$/i,
    { maxFiles: 8, maxBytes: 4 * 1024 * 1024 },
  );
  const swiftSourceText = readProjectTextSamples(
    root,
    entries,
    inspectionIssues,
    /\.swift$/i,
    { maxFiles: 48, maxBytes: 256 * 1024 },
  );
  const jvmSourceText = readProjectTextSamples(
    root,
    entries,
    inspectionIssues,
    /\.(?:java|kt|kts)$/i,
    { maxFiles: 48, maxBytes: 256 * 1024 },
  );
  const profileEvidence = new Map();
  const nonProfileEvidence = new Map();

  function addProfile(profile, source, reason) {
    const evidence = profileEvidence.get(profile) || [];
    evidence.push({ source, reason });
    profileEvidence.set(profile, evidence);
  }

  function addNonProfile(kind, source, reason) {
    const evidence = nonProfileEvidence.get(kind) || [];
    evidence.push({ source, reason });
    nonProfileEvidence.set(kind, evidence);
  }

  const webDependencies = [
    "@angular/core", "@remix-run/react", "astro", "next", "nuxt", "react-dom",
    "solid-js", "svelte", "vue",
  ];
  if (hasPath(/(?:^|\/)(?:index\.html|vite\.config\.[cm]?[jt]s|next\.config\.[cm]?[jt]s|nuxt\.config\.[cm]?[jt]s|svelte\.config\.[cm]?[jt]s|astro\.config\.[cm]?[jt]s)$/i)) {
    addProfile("web-app", "project-file", "web entrypoint or framework configuration");
  }
  if (hasAnyDependency(dependencies, webDependencies)) {
    addProfile("web-app", "package.json", "browser application framework dependency");
  }

  if (hasPath(/(?:^|\/)(?:project\.config\.json|project\.private\.config\.json)$/i)
    || hasPath(/(?:^|\/)(?:miniprogram|miniapp|cloudfunctions|cloud-functions)(?:\/|$)/i)) {
    addProfile("wechat-miniprogram", "project-structure", "Mini Program configuration or runtime directory");
  }

  const reactNativeAppEvidence = hasAnyDependency(dependencies, ["react-native", "expo"]);
  const flutterManifestEvidence = /\bsdk\s*:\s*flutter\b/i.test(pubspecText);
  const flutterAppEvidence = flutterManifestEvidence
    && (hasPath(/(?:^|\/)lib\/main\.dart$/i)
      || hasPath(/^(?:ios|android)(?:\/|$)/i));

  const packageSwiftIosEvidence = /\.iOS\s*\(/.test(packageSwiftText)
    || /\bIPHONEOS_DEPLOYMENT_TARGET\b/.test(packageSwiftText);
  const xcodeIosEvidence = /\b(?:IPHONEOS_DEPLOYMENT_TARGET|SDKROOT\s*=\s*iphoneos|SUPPORTED_PLATFORMS\s*=.*\biphone)/i.test(xcodeProjectText);
  const swiftSourceIosEvidence = /^\s*import\s+UIKit\b/m.test(swiftSourceText)
    || /\bUIApplicationDelegate\b/.test(swiftSourceText);
  const iosAppEvidence = reactNativeAppEvidence
    || flutterAppEvidence
    || packageSwiftIosEvidence
    || xcodeIosEvidence
    || swiftSourceIosEvidence;
  if (iosAppEvidence) {
    addProfile(
      "ios-app",
      reactNativeAppEvidence ? "package.json" : flutterAppEvidence ? "pubspec.yaml" : "swift-product-evidence",
      reactNativeAppEvidence
        ? "React Native or Expo mobile application dependency"
        : flutterAppEvidence
          ? "Flutter application manifest and entrypoint"
          : "iOS platform declaration or UIKit/Xcode iPhone source signal",
    );
  }

  const androidManifestEvidence = hasPath(/(?:^|\/)AndroidManifest\.xml$/i);
  const androidGradlePluginEvidence = /\bcom\.android\.(?:application|library|dynamic-feature|test)\b/i.test(gradleText);
  const androidSourceEvidence = /^\s*import\s+android(?:x)?\./m.test(jvmSourceText)
    || /\bandroid\.app\.Application\b/.test(jvmSourceText);
  const androidAppEvidence = reactNativeAppEvidence
    || flutterAppEvidence
    || androidManifestEvidence
    || androidGradlePluginEvidence
    || androidSourceEvidence;
  if (androidAppEvidence) {
    addProfile(
      "android-app",
      reactNativeAppEvidence ? "package.json" : flutterAppEvidence ? "pubspec.yaml" : "android-product-evidence",
      reactNativeAppEvidence
        ? "React Native or Expo mobile application dependency"
        : flutterAppEvidence
          ? "Flutter application manifest and entrypoint"
          : "Android manifest, Gradle plugin, or Android source signal",
    );
  }

  const backendDependencies = [
    "@hapi/hapi", "@nestjs/core", "express", "fastify", "h3", "hono", "koa",
  ];
  const backendDependencyEvidence = hasAnyDependency(dependencies, backendDependencies);
  const backendDirectoryEvidence = hasPath(/^(?:api|backend|server)(?:\/|$)/i)
    || hasPath(/^(?:apps|packages)\/[^/]*(?:api|backend|server)[^/]*(?:\/|$)/i);
  const backendLanguageEvidence = /\b(?:django|fastapi|flask|litestar|starlette)\b/i.test(pyprojectText)
    || /(?:github\.com\/(?:gin-gonic\/gin|gofiber\/fiber|labstack\/echo-go|go-chi\/chi))/i.test(goModText)
    || /\b(?:actix-web|axum|rocket)\b/i.test(cargoText)
    || /\b(?:spring-boot-starter-web|spring-boot-starter-webflux)\b/i.test(pomText)
    || /(?:vapor\/vapor|hummingbird-project\/hummingbird)|^\s*import\s+(?:Vapor|Hummingbird)\b/im.test(`${packageSwiftText}\n${swiftSourceText}`)
    || /\b(?:org\.springframework\.boot|io\.ktor|io\.micronaut|io\.quarkus)\b/i.test(`${gradleText}\n${jvmSourceText}`);
  if (backendDirectoryEvidence) addProfile("backend-api", "project-directory", "top-level backend or API service directory");
  if (backendDependencyEvidence) addProfile("backend-api", "package.json", "server framework dependency");
  if (backendLanguageEvidence) addProfile("backend-api", "language-manifest", "server framework dependency");

  const adminDependencyEvidence = [...dependencies].some((name) => /(?:^|[-_/])(?:admin|dashboard)(?:$|[-_/])/.test(name));
  const adminDirectoryEvidence = hasPath(/(?:^|\/)(?:admin|dashboard|management-console|ops-console|operations-console)(?:\/|$)/i)
    || hasPath(/^(?:apps|packages)\/[^/]*(?:admin|dashboard)[^/]*(?:\/|$)/i);
  if (adminDependencyEvidence || adminDirectoryEvidence) {
    addProfile("internal-admin", adminDirectoryEvidence ? "project-directory" : "package.json", "admin or operations console evidence");
  }

  const packageBin = typeof packageJson?.bin === "string"
    || (packageJson?.bin && typeof packageJson.bin === "object" && Object.keys(packageJson.bin).length > 0);
  const cliDependencyEvidence = hasAnyDependency(dependencies, [
    "@oclif/core", "cac", "clipanion", "commander", "meow", "yargs",
  ]);
  const cliDirectoryEvidence = hasPath(/^(?:bin|cli|cmd)(?:\/|$)/i);
  const cliLanguageEvidence = /\b(?:click|typer)\b/i.test(pyprojectText)
    || /\bclap\b/i.test(cargoText)
    || (pathSet.has("Package.swift")
      && !iosAppEvidence
      && !backendLanguageEvidence
      && (/\.executableTarget\s*\(/.test(packageSwiftText)
        || hasPath(/(?:^|\/)Sources\/[^/]+\/main\.swift$/i)));
  if (packageBin) addNonProfile("cli", "package.json", "package bin entrypoint");
  if (cliDependencyEvidence) addNonProfile("cli", "package.json", "CLI framework dependency");
  if (cliDirectoryEvidence) addNonProfile("cli", "project-directory", "CLI or command entrypoint directory");
  if (cliLanguageEvidence) addNonProfile("cli", "language-manifest", "CLI framework dependency");
  if (flutterManifestEvidence && !flutterAppEvidence) {
    addNonProfile("flutter-package", "pubspec.yaml", "Flutter package has no mobile application entrypoint evidence");
  }
  if (gradleText && !androidAppEvidence && !backendLanguageEvidence) {
    addNonProfile("jvm-project", "gradle", "Gradle project has no Android product or source signal");
  }
  if (pathSet.has("Package.swift") && !iosAppEvidence && !backendLanguageEvidence && !cliLanguageEvidence) {
    addNonProfile("swift-package", "Package.swift", "Swift package has no iOS application product or source signal");
  }

  const profiles = [...profileEvidence.keys()].sort();
  const projectState = entries.length === 0 ? "NEW_EMPTY_PROJECT" : "EXISTING_PROJECT";
  const inspectionStatus = inspectionIssues.length > 0 ? "INCOMPLETE" : "COMPLETE";
  return {
    projectRoot: root,
    projectState,
    technicalStatus: inspectionStatus === "INCOMPLETE"
      ? "PROJECT_EVIDENCE_INCOMPLETE"
      : profiles.length > 0
      ? "PROJECT_EVIDENCE_INFERRED"
      : projectState === "EXISTING_PROJECT"
        ? "TECHNICAL_DISCOVERY_REQUIRED"
        : "NO_PROJECT_EVIDENCE",
    profiles,
    profileSignals: profiles.map((profile) => ({
      profile,
      evidence: profileEvidence.get(profile),
    })),
    nonProfileSignals: [...nonProfileEvidence.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([kind, evidence]) => ({
      kind,
      evidence,
    })),
    inspectedEntries: entries.length,
    truncated: scan.truncated,
    inspectionStatus,
    inspectionIssues,
  };
}

const goalProfileRules = [
  {
    profile: "wechat-miniprogram",
    patterns: [
      /\bwechat\s+mini\s*program\b/i,
      /\bmini\s*program\b/i,
      /微信小程序|小程序/u,
    ],
  },
  {
    profile: "ios-app",
    patterns: [
      /\bios\b/i,
      /\biphone\b/i,
      /\bipad\b/i,
      /\bswiftui\b/i,
      /\bapp\s*store\b/i,
      /苹果(?:应用|客户端)|iPhone应用|iOS应用/iu,
    ],
  },
  {
    profile: "android-app",
    patterns: [
      /\bandroid\b/i,
      /\bgoogle\s+play\b/i,
      /安卓(?:应用|客户端)?/u,
    ],
  },
  {
    profile: "internal-admin",
    patterns: [
      /\binternal\s+admin\b/i,
      /\badmin\s+(?:portal|console|dashboard)\b/i,
      /\bback[ -]?office\b/i,
      /\bmanagement\s+(?:platform|system)\b/i,
      /管理后台|运营后台|内部管理(?:平台|系统)|(?:企业|业务|管理|数据)中台/u,
    ],
  },
  {
    profile: "backend-api",
    patterns: [
      /\bback[ -]?end\b/i,
      /\bserver[- ]side\b/i,
      /\b(?:rest|graphql)\s+api\b/i,
      /\bapi\s+(?:service|server)\b/i,
      /\b(?:build|create|develop|implement|design|expose|serve|maintain|ship)\s+(?:an?\s+)?(?:http\s+|json\s+|public\s+|private\s+|internal\s+|rest(?:ful)?\s+)?api\b/i,
      /^\s*(?:an?\s+)?(?:http\s+|json\s+|public\s+|private\s+|internal\s+|rest(?:ful)?\s+)?api\b/i,
      /(?:开发|构建|实现|设计)(?:一个)?\s*API\b/iu,
      /后端|服务端|接口服务|后台(?:接口|服务)|带(?:一个)?后台/u,
    ],
  },
  {
    profile: "web-app",
    patterns: [
      /\bweb\s*(?:app|application|site)?\b/i,
      /\bwebsite\b/i,
      /\bbrowser[- ]based\b/i,
      /\bfrontend\b/i,
      /网页|网站|浏览器端|Web应用|前端应用/iu,
    ],
  },
];

const crossPlatformMobileGoalPatterns = [
  /\breact[ -]?native\b/i,
  /\bflutter\b/i,
];

function patternMatches(text, pattern) {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  return [...text.matchAll(new RegExp(pattern.source, flags))];
}

function negationForMatch(text, match) {
  const index = match.index || 0;
  const matchedText = match[0] || "";
  const prefix = text.slice(Math.max(0, index - 80), index)
    .split(/[.!?;:,\n，。；：！？]/u)
    .at(-1) || "";
  const suffix = text.slice(index + matchedText.length, index + matchedText.length + 64)
    .split(/[.!?;:,\n，。；：！？]/u)[0] || "";

  if (/\bnot\s+only\s*$/i.test(prefix)) return null;
  if (/\b(?:not|no|without|excluding?|exclude|except(?:\s+for)?|rather\s+than|instead\s+of|never|non[-\s]|no\s+longer)(?:\s+(?:an?|the|any|target(?:ing)?|support(?:ing)?|for|on|native|mobile|app(?:lication)?))*\s*$/i.test(prefix)) {
    return "preceded by an explicit negation";
  }
  if (/(?:不是|并非|不做|不开发|不支持|不面向|无需|不要|排除|除外|非)\s*$/u.test(prefix)) {
    return "preceded by an explicit negation";
  }
  if (/^\s*(?:app(?:lication)?\s+)?(?:is\s+)?(?:not|isn't|isnt|won't|wont|excluded|unsupported|out\s+of\s+scope|not\s+targeted)\b/i.test(suffix)) {
    return "followed by an explicit negation";
  }
  if (/^\s*(?:应用|客户端)?(?:不做|不开发|不支持|不面向|不在范围|排除)/u.test(suffix)) {
    return "followed by an explicit negation";
  }
  return null;
}

const platformTokenPattern = /\b(?:ios|iphone|ipad|android|react[ -]?native|flutter|wechat\s+mini\s*program|mini\s*program|web(?:\s+(?:app|application|site))?)\b|微信小程序|小程序|安卓(?:应用|客户端)?|苹果(?:应用|客户端)|网页|网站|浏览器端/iu;

function clauseContext(text, match) {
  const index = match.index || 0;
  const matchedText = match[0] || "";
  const before = text.slice(0, index);
  const after = text.slice(index + matchedText.length);
  const boundary = /[.!?;:\n，。；：！？]/u;
  const prefix = before.split(boundary).at(-1) || "";
  const suffix = after.split(boundary)[0] || "";
  return {
    clause: `${prefix}${matchedText}${suffix}`,
    prefix,
    suffix,
  };
}

function contextualRoleForMatch(text, match) {
  const negation = negationForMatch(text, match);
  if (negation) return { role: "EXCLUDED", reason: negation };

  const { clause, prefix, suffix } = clauseContext(text, match);
  const platformTokens = clause.match(new RegExp(platformTokenPattern.source, "giu")) || [];
  const hasAlternative = platformTokens.length > 1
    && /\b(?:or|either)\b|(?:或者|还是|二选一|任选其一)|(?:^|[^不])或(?:$|[^者])/iu.test(clause);
  if (hasAlternative) {
    return { role: "UNRESOLVED_ALTERNATIVE", reason: "the product goal presents alternative platforms without selecting a target" };
  }

  if (/\b(?:compare|comparison|versus|vs\.?|which\s+is\s+better|evaluate\s+between)\b|对比|比较|区别|优劣/iu.test(clause)) {
    return { role: "COMPARISON", reason: "the platform appears in a comparison rather than a delivery target" };
  }

  const immediatePrefix = prefix.slice(-80);
  const immediateSuffix = suffix.slice(0, 80);
  if (/\b(?:existing|current|legacy|old|previous|former)\s+(?:native\s+)?(?:app(?:lication)?\s+)?$/iu.test(immediatePrefix)
    || /(?:现有|当前|旧有|旧版|原有|原来的)(?:的)?\s*$/u.test(immediatePrefix)
    || /\b(?:from|replace(?:ment)?\s+for)\s+(?:our\s+|the\s+|an?\s+)?(?:existing\s+|current\s+|legacy\s+)?$/iu.test(immediatePrefix)
    || /(?:从|替代|替换)(?:现有|当前|旧有|原有)?(?:的)?\s*$/u.test(immediatePrefix)
    || /^\s*(?:app(?:lication)?|client)?\s*(?:to|into)\b/iu.test(immediateSuffix)
    || /^\s*(?:应用|客户端|项目)?\s*(?:迁移到|改为|转为|升级为)/u.test(immediateSuffix)) {
    return { role: "EXISTING_SOURCE", reason: "the platform describes an existing or source system, not the selected delivery target" };
  }

  return { role: "TARGET", reason: "the platform is an unambiguous delivery target" };
}

export function deriveProfilesFromGoal(goal) {
  const text = String(goal || "").trim();
  if (!text) return { profiles: [], signals: [], negatedSignals: [], contextualSignals: [] };
  const signals = [];
  const negatedSignals = [];
  const contextualSignals = [];
  for (const rule of goalProfileRules) {
    const accepted = [];
    const rejected = [];
    const contextual = [];
    for (const pattern of rule.patterns) {
      for (const match of patternMatches(text, pattern)) {
        const classification = contextualRoleForMatch(text, match);
        if (classification.role === "TARGET") accepted.push(match[0]);
        else if (classification.role === "EXCLUDED") rejected.push({ matched: match[0], reason: classification.reason });
        else contextual.push({ matched: match[0], role: classification.role, reason: classification.reason });
      }
    }
    const matched = [...new Set(accepted)].sort();
    if (matched.length > 0) {
      signals.push({ profile: rule.profile, matched });
    }
    if (rejected.length > 0) {
      negatedSignals.push({
        profile: rule.profile,
        matched: [...new Set(rejected.map((item) => item.matched))].sort(),
        reasons: [...new Set(rejected.map((item) => item.reason))].sort(),
      });
    }
    if (contextual.length > 0) {
      contextualSignals.push({
        profile: rule.profile,
        matches: contextual
          .filter((item, index, rows) => rows.findIndex((candidate) => candidate.matched === item.matched && candidate.role === item.role) === index)
          .sort((left, right) => `${left.role}:${left.matched}`.localeCompare(`${right.role}:${right.matched}`)),
      });
    }
  }

  const crossPlatformMatches = [];
  for (const pattern of crossPlatformMobileGoalPatterns) {
    for (const match of patternMatches(text, pattern)) {
      crossPlatformMatches.push({
        matched: match[0],
        ...contextualRoleForMatch(text, match),
      });
    }
  }
  const acceptedCrossPlatformMatches = [...new Set(crossPlatformMatches
    .filter((item) => item.role === "TARGET")
    .map((item) => item.matched))].sort();
  const explicitMobileProfiles = signals
    .map((item) => item.profile)
    .filter((profile) => ["ios-app", "android-app"].includes(profile));
  const explicitWebProfile = signals.some((item) => item.profile === "web-app");
  const crossPlatformProfiles = explicitMobileProfiles.length > 0
    ? [...new Set(explicitMobileProfiles)]
    : explicitWebProfile ? [] : ["ios-app", "android-app"];

  function mergeGoalSignal(profile, matched) {
    const existing = signals.find((item) => item.profile === profile);
    if (existing) {
      existing.matched = [...new Set([...existing.matched, ...matched])].sort();
    } else {
      signals.push({ profile, matched });
    }
  }

  if (acceptedCrossPlatformMatches.length > 0) {
    for (const profile of crossPlatformProfiles) {
      mergeGoalSignal(profile, acceptedCrossPlatformMatches);
    }
  }
  const rejectedCrossPlatformMatches = crossPlatformMatches.filter((item) => item.role === "EXCLUDED");
  const contextualCrossPlatformMatches = crossPlatformMatches.filter((item) => !["TARGET", "EXCLUDED"].includes(item.role));
  for (const profile of ["ios-app", "android-app"]) {
    if (rejectedCrossPlatformMatches.length > 0) {
      const existing = negatedSignals.find((item) => item.profile === profile);
      const matched = rejectedCrossPlatformMatches.map((item) => item.matched);
      const reasons = rejectedCrossPlatformMatches.map((item) => item.reason);
      if (existing) {
        existing.matched = [...new Set([...existing.matched, ...matched])].sort();
        existing.reasons = [...new Set([...existing.reasons, ...reasons])].sort();
      } else {
        negatedSignals.push({
          profile,
          matched: [...new Set(matched)].sort(),
          reasons: [...new Set(reasons)].sort(),
        });
      }
    }
    if (contextualCrossPlatformMatches.length > 0) {
      const existing = contextualSignals.find((item) => item.profile === profile);
      const matches = contextualCrossPlatformMatches.map((item) => ({
        matched: item.matched,
        role: item.role,
        reason: item.reason,
      }));
      if (existing) existing.matches.push(...matches);
      else contextualSignals.push({ profile, matches });
    }
  }
  return {
    profiles: signals.map((item) => item.profile).sort(),
    signals,
    negatedSignals,
    contextualSignals,
  };
}

function requiresNonPlatformTechnicalDiscovery(goal) {
  const text = String(goal || "").trim();
  if (!text) return false;
  return /\b(?:api|react[ -]?native|flutter|cli|command[- ]line(?:\s+(?:interface|application|app|tool))?|terminal\s+(?:application|app|tool)|software\s+library|reusable\s+[a-z0-9.+#-]+\s+library|sdk|jupyter|notebook|desktop\s+(?:application|app|client)|browser\s+extension|ide\s+(?:extension|plugin)|daemon|background\s+worker|worker\s+service|npm\s+package|python\s+package|rust\s+crate)\b|命令行(?:界面|应用|工具)?|可复用(?:代码)?库|软件开发包|笔记本|桌面(?:应用|客户端)|浏览器扩展|插件|后台工作进程/iu.test(text);
}

export function deriveBaselineDemand(goal, profiles = []) {
  const text = String(goal || "").trim();
  const releaseRequired = /\b(?:deploy|deployment|publish|release|production|app\s*store|google\s*play|store\s+submission)\b|上线|发布|部署|生产环境|应用商店|提交审核/iu.test(text);
  const externalReleaseRisk = /\b(?:deploy|deployment|publish|production|app\s*store|google\s*play|store\s+submission)\b|上线|发布|部署|生产环境|应用商店|提交审核/iu.test(text);
  const paymentRisk = /\b(?:payments?|billing|charges?|refunds?|payouts?|value\s+transfers?|credits?|balances?)\b|支付|收款|退款|结算|资金|转账|余额|储值|积分|额度/iu.test(text);
  const authRisk = /\b(?:auth(?:entication|orization)?|log[ -]?in|sign[ -]?in|permission|role[- ]based|access\s+control|identity)\b|认证|登录|登陆|权限|角色|访问控制/iu.test(text);
  const regulatedRisk = /\b(?:regulated|healthcare|medical|patient|financial|finance|tax|personal\s+data|pii|hipaa|gdpr|compliance)\b|合规|医疗|患者|病历|金融|财务|税务|个人信息|隐私|监管/iu.test(text);
  const irreversibleRisk = /\b(?:irreversible|destructive|delete\s+all|drop\s+(?:all\s+)?tables?|truncate\s+(?:all\s+)?tables?|production\s+data)\b|不可逆|破坏性|删除全部|批量删除|清空数据|删库|生产数据/iu.test(text);
  const destructiveDataRisk = /\b(?:data\s+deletion|delete\s+all|drop\s+(?:all\s+)?tables?|truncate\s+(?:all\s+)?tables?|production\s+data)\b|删除全部|批量删除|清空数据|删库|生产数据/iu.test(text);
  const dataRisk = regulatedRisk
    || destructiveDataRisk
    || /\b(?:database|schema|migration|persistent\s+data|data\s+store)\b|数据库|数据存储|迁移|数据结构/iu.test(text);
  const credentialRisk = /\b(?:credential|secret|api\s+key|private\s+key)\b|密钥|凭证/iu.test(text);
  const cloudbaseRisk = /\bcloudbase\b|微信云开发|云开发/iu.test(text);
  const highRisk = externalReleaseRisk || paymentRisk || authRisk || regulatedRisk || dataRisk || irreversibleRisk || credentialRisk || cloudbaseRisk;
  const lightweight = !highRisk && /\b(?:prototype|proof\s+of\s+concept|poc|throwaway|disposable|demo|spike)\b|原型|概念验证|一次性演示|技术试验/iu.test(text);
  const recommendedLevel = profiles.length === 0
    ? null
    : highRisk ? "BL2_INDUSTRIAL" : lightweight ? "BL0_LIGHTWEIGHT" : "BL1_STANDARD";
  const industrialPacks = highRisk
    ? [
        ...profiles.map((profile) => industrialPackForProfile[profile]).filter(Boolean),
        ...(paymentRisk ? ["payment-value-transfer-industrial"] : []),
        ...(authRisk ? ["auth-permission-industrial"] : []),
        ...(dataRisk ? ["data-storage-industrial"] : []),
        ...(cloudbaseRisk ? ["cloudbase-industrial"] : []),
        ...(irreversibleRisk ? ["high-risk-change-industrial"] : []),
      ]
    : [];
  const riskSignals = [
    externalReleaseRisk && "RELEASE_OR_PRODUCTION",
    paymentRisk && "PAYMENT_OR_VALUE_TRANSFER",
    authRisk && "AUTH_OR_PERMISSION",
    regulatedRisk && "REGULATED_OR_SENSITIVE_DATA",
    dataRisk && "PERSISTENT_DATA_OR_MIGRATION",
    irreversibleRisk && "IRREVERSIBLE_OR_DESTRUCTIVE_EFFECT",
    credentialRisk && "CREDENTIAL_OR_SECRET_BOUNDARY",
    cloudbaseRisk && "CLOUDBASE_RUNTIME",
  ].filter(Boolean);
  return {
    recommendedLevel,
    releaseRequired,
    industrialPacks: [...new Set(industrialPacks)].sort(),
    riskSignals,
    lightweightSignal: lightweight,
    realWorldConsentRequired: externalReleaseRisk || paymentRisk || irreversibleRisk,
    realWorldConsentReasons: [
      externalReleaseRisk && "EXTERNAL_RELEASE_OR_PRODUCTION",
      paymentRisk && "PAID_OR_VALUE_TRANSFER_EFFECT",
      irreversibleRisk && "IRREVERSIBLE_OR_DESTRUCTIVE_EFFECT",
    ].filter(Boolean),
  };
}

export function parseSelectionIds(value) {
  if (!value || value === true) return [];
  return [...new Set(String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean))].sort();
}

export function normalizeBaselineLevel(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (!normalized) return null;
  const aliases = {
    BL0: "BL0_LIGHTWEIGHT",
    BL0_LIGHTWEIGHT: "BL0_LIGHTWEIGHT",
    BL1: "BL1_STANDARD",
    BL1_STANDARD: "BL1_STANDARD",
    BL2: "BL2_INDUSTRIAL",
    BL2_INDUSTRIAL: "BL2_INDUSTRIAL",
  };
  return aliases[normalized] || null;
}

export function defaultProfilesForStarter(starter) {
  return [...(starterProfiles[String(starter || "")] || [])];
}

export function knownProfileIds(kitRoot) {
  const root = path.join(kitRoot, "profiles");
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, entry.name, "profile.md")))
    .map((entry) => entry.name)
    .sort();
}

function loadProfileBaseline(kitRoot, profileId) {
  const file = path.join(kitRoot, "profiles", profileId, "baseline.json");
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export function incompatibleProfilesForStarter(kitRoot, profiles, starter) {
  const selectedStarter = String(starter || "").trim();
  if (!selectedStarter) return [];
  return profiles.flatMap((profile) => {
    const baseline = loadProfileBaseline(kitRoot, profile);
    const compatibleStarters = Array.isArray(baseline?.compatibleStarters)
      ? baseline.compatibleStarters
      : [];
    if (compatibleStarters.includes(selectedStarter)) return [];
    return [{ profile, starter: selectedStarter, compatibleStarters }];
  });
}

export function loadPackIndex(kitRoot, registry) {
  const file = path.join(kitRoot, registry, "index.json");
  if (!fs.existsSync(file)) throw new Error(`${registry}/index.json not found`);
  let value;
  try {
    value = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`${registry}/index.json is invalid JSON: ${error.message}`);
  }
  if (!Array.isArray(value.packs)) throw new Error(`${registry}/index.json must contain packs`);
  return value;
}

function normalizedPackRelationRecord(pack) {
  return {
    id: String(pack?.id || "").trim(),
    compatiblePacks: new Set(Array.isArray(pack?.compatiblePacks) ? pack.compatiblePacks : []),
    conflictsWith: new Set(Array.isArray(pack?.conflictsWith) ? pack.conflictsWith : []),
  };
}

export function evaluateIndustrialPackCompatibility(packs) {
  const records = packs.map(normalizedPackRelationRecord).filter((pack) => pack.id);
  const pairs = [];
  for (let leftIndex = 0; leftIndex < records.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < records.length; rightIndex += 1) {
      const left = records[leftIndex];
      const right = records[rightIndex];
      const conflictDeclaredBy = [
        left.conflictsWith.has(right.id) ? left.id : null,
        right.conflictsWith.has(left.id) ? right.id : null,
      ].filter(Boolean);
      const leftAllowsRight = left.compatiblePacks.has(right.id);
      const rightAllowsLeft = right.compatiblePacks.has(left.id);
      let status = "COMPATIBLE";
      let reason = "both manifests explicitly declare compatibility";
      if (conflictDeclaredBy.length > 0) {
        status = "EXPLICIT_CONFLICT";
        reason = `conflict declared by ${conflictDeclaredBy.join(", ")}`;
      } else if (leftAllowsRight !== rightAllowsLeft) {
        status = "ONE_WAY_COMPATIBILITY";
        reason = "only one manifest declares compatibility";
      } else if (!leftAllowsRight) {
        status = "UNKNOWN_RELATION";
        reason = "neither manifest explicitly declares compatibility";
      }
      pairs.push({
        left: left.id,
        right: right.id,
        status,
        compatible: status === "COMPATIBLE",
        reason,
        authority: "BILATERAL_MANIFEST_ALLOWLIST",
        declarations: {
          [left.id]: leftAllowsRight,
          [right.id]: rightAllowsLeft,
        },
        conflictDeclaredBy,
      });
    }
  }
  const incompatiblePairs = pairs.filter((pair) => !pair.compatible);
  return {
    model: "BILATERAL_MANIFEST_ALLOWLIST",
    status: incompatiblePairs.length > 0 ? "INCOMPATIBLE" : "COMPATIBLE",
    pairs,
    incompatiblePairs,
  };
}

function loadIndustrialPackRelationRecords(kitRoot, index, selectedPackIds) {
  const entriesById = new Map(index.packs.map((entry) => [entry.id, entry]));
  return selectedPackIds.map((id) => {
    const entry = entriesById.get(id);
    const manifestPath = path.join(kitRoot, "industrial-packs", entry?.path || "", "pack.json");
    if (!entry || !fs.existsSync(manifestPath)) {
      throw selectionError(
        "INDUSTRIAL_PACK_MANIFEST_INVALID",
        `Industrial pack ${id} has no readable pack.json manifest`,
        { packId: id, manifestPath },
      );
    }
    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    } catch (error) {
      throw selectionError(
        "INDUSTRIAL_PACK_MANIFEST_INVALID",
        `Industrial pack ${id} has invalid pack.json: ${error.message}`,
        { packId: id, manifestPath },
      );
    }
    return {
      id,
      compatiblePacks: manifest.compatiblePacks,
      conflictsWith: manifest.conflictsWith,
    };
  });
}

export function recommendStandardPackIds(kitRoot, profiles, baselineLevel, options = {}) {
  const index = loadPackIndex(kitRoot, "standard-baseline-packs");
  const selectedProfiles = new Set(profiles);
  return index.packs
    .filter((entry) => entry && entry.id && entry.path && entry.status !== "planned")
    .filter((entry) => {
      const applies = Array.isArray(entry.appliesToProfiles) ? entry.appliesToProfiles : [];
      const profileMatch = applies.some((profile) => selectedProfiles.has(profile));
      const environmentDefault = entry.id === "environment-standard"
        && ["BL1_STANDARD", "BL2_INDUSTRIAL"].includes(baselineLevel)
        && profiles.length > 0;
      const releaseDefault = entry.type === "release" && options.releaseRequired === true;
      const allowed = !Array.isArray(entry.allowedForBL)
        || entry.allowedForBL.length === 0
        || entry.allowedForBL.includes(baselineLevel);
      const recommended = !Array.isArray(entry.recommendedForBL)
        || entry.recommendedForBL.length === 0
        || entry.recommendedForBL.includes(baselineLevel);
      const lightweightDefaultAllowed = baselineLevel !== "BL0_LIGHTWEIGHT"
        || (entry.activeByDefault === true && entry.requiresEvidenceForConfirmed !== true);
      return allowed && recommended && lightweightDefaultAllowed && (profileMatch || environmentDefault || releaseDefault);
    })
    .map((entry) => entry.id)
    .sort();
}

export function resolveBaselineConfiguration(kitRoot, options = {}) {
  const explicitProfiles = parseSelectionIds(options.profiles);
  const starterDefaults = defaultProfilesForStarter(options.starter);
  const goalProjection = deriveProfilesFromGoal(options.goal);
  const projectEvidence = deriveProfilesFromProjectEvidence(options.projectRoot, options.projectEvidenceOptions);
  if (options.existingProject === true && !String(options.projectRoot || "").trim()) {
    throw selectionError(
      "PROJECT_ROOT_REQUIRED_FOR_EXISTING_PROJECT",
      "Existing-project baseline selection requires an exact target project root",
    );
  }
  if (projectEvidence.inspectionStatus === "INCOMPLETE") {
    throw selectionError(
      "PROJECT_EVIDENCE_INCOMPLETE",
      `Project evidence inspection is incomplete: ${projectEvidence.inspectionIssues.map((issue) => issue.message).join("; ")}`,
      { projectEvidence },
    );
  }
  if (options.existingProject === false && projectEvidence.projectState === "EXISTING_PROJECT") {
    throw selectionError(
      "TARGET_PROJECT_STATE_CONFLICT",
      `Target ${projectEvidence.projectRoot} contains existing project facts but was declared as a new project`,
      { projectEvidence },
    );
  }
  const projectEvidenceProfiles = projectEvidence.profiles || [];
  const existingProject = options.existingProject === true || projectEvidence.projectState === "EXISTING_PROJECT";
  const seededProfiles = explicitProfiles.length > 0
    ? explicitProfiles
    : starterDefaults;
  const seededPrimaryProfiles = seededProfiles.filter((profile) => primaryPlatformProfiles.has(profile));
  const incompatibleEvidencePrimaryProfiles = seededPrimaryProfiles.length > 0
    ? projectEvidenceProfiles.filter((profile) => primaryPlatformProfiles.has(profile) && !seededPrimaryProfiles.includes(profile))
    : [];
  if (incompatibleEvidencePrimaryProfiles.length > 0) {
    throw selectionError(
      "PROJECT_EVIDENCE_PROFILE_CONFLICT",
      `Project evidence indicates primary profile(s) ${incompatibleEvidencePrimaryProfiles.join(", ")}, which conflict with selected/starter primary profile(s) ${seededPrimaryProfiles.join(", ")}`,
      {
        selectedOrStarterProfiles: seededProfiles,
        inferredProfiles: projectEvidenceProfiles,
        conflictingProfiles: incompatibleEvidencePrimaryProfiles,
        projectEvidence,
      },
    );
  }
  const evidenceAugmentedProfiles = [...new Set([...seededProfiles, ...projectEvidenceProfiles])].sort();
  const nonPlatformTechnicalDiscovery = requiresNonPlatformTechnicalDiscovery(options.goal)
    || (projectEvidence.nonProfileSignals || []).length > 0;
  const codexFallbackProfiles = evidenceAugmentedProfiles.length === 0
    && String(options.starter || "") === "generic-project"
    && String(options.goal || "").trim()
    && !existingProject
    && !nonPlatformTechnicalDiscovery
    && goalProjection.profiles.length === 0
    && goalProjection.contextualSignals.length === 0
    && goalProjection.negatedSignals.length === 0
      ? ["web-app"]
      : [];
  const configuredProfiles = evidenceAugmentedProfiles.length > 0
    ? evidenceAugmentedProfiles
    : codexFallbackProfiles;
  const missingGoalProfiles = goalProjection.profiles.filter((profile) => !configuredProfiles.includes(profile));
  const missingGoalPrimaryProfiles = missingGoalProfiles.filter((profile) => primaryPlatformProfiles.has(profile));
  const goalConflict = explicitProfiles.length > 0
    ? missingGoalProfiles
    : missingGoalPrimaryProfiles;
  if (configuredProfiles.length > 0 && goalConflict.length > 0) {
    throw selectionError(
      "GOAL_PROFILE_CONFLICT",
      `Project goal platform signal(s) ${goalConflict.join(", ")} conflict with selected/starter profile(s) ${configuredProfiles.join(", ")}; Codex must choose a matching starter/profile before the baseline can be ready`,
      {
        goalProfiles: goalProjection.profiles,
        configuredProfiles,
        conflictingProfiles: goalConflict,
      },
    );
  }
  const profiles = configuredProfiles.length > 0
    ? [...new Set([...configuredProfiles, ...goalProjection.profiles])].sort()
    : goalProjection.profiles;
  const baselineDemand = deriveBaselineDemand(options.goal, profiles);
  const requestedLevel = options.baselineLevel;
  const baselineLevel = normalizeBaselineLevel(requestedLevel)
    || baselineDemand.recommendedLevel;
  const technicalSelectionStatus = explicitProfiles.length > 0
    ? projectEvidenceProfiles.some((profile) => !explicitProfiles.includes(profile))
      ? "EXPLICIT_AND_PROJECT_EVIDENCE_SELECTED"
      : "EXPLICIT_SELECTION"
    : starterDefaults.length > 0
      ? projectEvidenceProfiles.some((profile) => !starterDefaults.includes(profile))
        ? "STARTER_AND_PROJECT_EVIDENCE_SELECTED"
        : "STARTER_DERIVED"
      : projectEvidenceProfiles.length > 0
        ? "PROJECT_EVIDENCE_INFERRED"
        : codexFallbackProfiles.length > 0
          ? "NEW_PROJECT_DEFAULT"
          : goalProjection.profiles.length > 0
            ? "GOAL_DERIVED"
            : "TECHNICAL_DISCOVERY_REQUIRED";

  if (requestedLevel && !normalizeBaselineLevel(requestedLevel)) {
    throw new Error(`Unknown baseline level: ${requestedLevel}`);
  }
  if (requestedLevel && profiles.length === 0) {
    throw selectionError(
      "PROFILE_REQUIRED_FOR_BASELINE",
      "A selected baseline level requires at least one concrete project profile",
      { requestedLevel, projectEvidence },
    );
  }
  if (baselineLevel && baselineDemand.recommendedLevel
    && baselineLevelRank.get(baselineLevel) < baselineLevelRank.get(baselineDemand.recommendedLevel)) {
    throw new Error(
      `Selected baseline ${baselineLevel} is below the minimum ${baselineDemand.recommendedLevel} derived from current goal risk: ${baselineDemand.riskSignals.join(", ") || "project evidence"}`,
    );
  }

  const knownProfiles = new Set(knownProfileIds(kitRoot));
  const unknownProfiles = profiles.filter((profile) => !knownProfiles.has(profile));
  if (unknownProfiles.length > 0) {
    throw new Error(`Unknown profile(s): ${unknownProfiles.join(", ")}`);
  }
  if (starterDefaults.length > 0 && !starterDefaults.every((profile) => profiles.includes(profile))) {
    throw selectionError(
      "STARTER_PROFILE_REQUIREMENT_MISMATCH",
      `Starter ${options.starter} requires profile(s) ${starterDefaults.join(", ")}; selected profiles are ${profiles.join(", ") || "none"}`,
      { starter: options.starter, requiredProfiles: starterDefaults, selectedProfiles: profiles },
    );
  }
  const resolvedStarterConflicts = incompatibleProfilesForStarter(kitRoot, profiles, options.starter);
  if (resolvedStarterConflicts.length > 0) {
    const details = resolvedStarterConflicts.map((item) => (
      `${item.profile} (compatible starters: ${item.compatibleStarters.join(", ") || "none declared"})`
    ));
    throw selectionError(
      "STARTER_PROFILE_INCOMPATIBLE",
      `Starter ${options.starter} is incompatible with resolved profile(s): ${details.join("; ")}`,
      { starter: options.starter, incompatibleProfiles: resolvedStarterConflicts },
    );
  }

  const standardIndex = loadPackIndex(kitRoot, "standard-baseline-packs");
  const standardById = new Map(standardIndex.packs.map((entry) => [entry.id, entry]));
  const explicitStandard = parseSelectionIds(options.standardPacks);
  if (explicitStandard.length > 0 && (!baselineLevel || profiles.length === 0)) {
    throw new Error("Selected standard baseline packs require a concrete baseline level and project profile");
  }
  const minimumStandardPacks = baselineLevel && profiles.length > 0
    ? recommendStandardPackIds(kitRoot, profiles, baselineLevel, baselineDemand)
    : [];
  const standardPacks = [...new Set([...minimumStandardPacks, ...explicitStandard])].sort();
  const unknownStandard = standardPacks.filter((id) => !standardById.has(id));
  if (unknownStandard.length > 0) {
    throw new Error(`Unknown standard baseline pack(s): ${unknownStandard.join(", ")}`);
  }
  const incompatibleStandard = standardPacks.filter((id) => {
    const allowed = standardById.get(id)?.allowedForBL;
    return baselineLevel && Array.isArray(allowed) && allowed.length > 0 && !allowed.includes(baselineLevel);
  });
  if (incompatibleStandard.length > 0) {
    throw new Error(`Standard baseline pack(s) incompatible with ${baselineLevel}: ${incompatibleStandard.join(", ")}`);
  }
  const profileIncompatibleStandard = standardPacks.filter((id) => {
    const applies = standardById.get(id)?.appliesToProfiles;
    return Array.isArray(applies) && applies.length > 0 && !applies.some((profile) => profiles.includes(profile));
  });
  if (profileIncompatibleStandard.length > 0) {
    throw new Error(`Standard baseline pack(s) incompatible with selected profiles ${profiles.join(", ")}: ${profileIncompatibleStandard.join(", ")}`);
  }
  if (["BL1_STANDARD", "BL2_INDUSTRIAL"].includes(baselineLevel)) {
    const selectedStandardEntries = standardPacks.map((id) => standardById.get(id)).filter(Boolean);
    if (!selectedStandardEntries.some((entry) => entry.type === "environment")) {
      throw new Error(`${baselineLevel} requires an environment standard pack`);
    }
    const uncovered = profiles.filter((profile) => !selectedStandardEntries.some((entry) => {
      return entry.type !== "environment" && (entry.appliesToProfiles || []).includes(profile);
    }));
    if (uncovered.length > 0) {
      throw new Error(`Standard baseline has no platform/capability pack for selected profile(s): ${uncovered.join(", ")}`);
    }
  }

  const industrialIndex = loadPackIndex(kitRoot, "industrial-packs");
  const industrialById = new Map(industrialIndex.packs.map((entry) => [entry.id, entry]));
  const explicitIndustrialPacks = parseSelectionIds(options.industrialPacks);
  const minimumIndustrialPacks = baselineLevel === "BL2_INDUSTRIAL"
    ? baselineDemand.industrialPacks
    : [];
  const industrialPacks = [...new Set([...minimumIndustrialPacks, ...explicitIndustrialPacks])].sort();
  const unknownIndustrial = industrialPacks.filter((id) => !industrialById.has(id));
  if (unknownIndustrial.length > 0) {
    throw new Error(`Unknown industrial pack(s): ${unknownIndustrial.join(", ")}`);
  }
  const industrialPackCompatibility = evaluateIndustrialPackCompatibility(
    loadIndustrialPackRelationRecords(kitRoot, industrialIndex, industrialPacks),
  );
  if (industrialPackCompatibility.status !== "COMPATIBLE") {
    const details = industrialPackCompatibility.incompatiblePairs
      .map((pair) => `${pair.left} + ${pair.right}: ${pair.status} (${pair.reason})`);
    throw selectionError(
      "INDUSTRIAL_PACKS_INCOMPATIBLE",
      `Selected industrial packs are not explicitly compatible: ${details.join("; ")}`,
      { compatibility: industrialPackCompatibility },
    );
  }
  if (industrialPacks.length > 0 && baselineLevel !== "BL2_INDUSTRIAL") {
    throw new Error("Industrial packs require BL2_INDUSTRIAL");
  }
  if (baselineLevel === "BL2_INDUSTRIAL" && industrialPacks.length === 0) {
    throw new Error("BL2_INDUSTRIAL requires at least one concrete selected industrial pack");
  }
  const profileIncompatibleIndustrial = industrialPacks.filter((id) => {
    const entry = industrialById.get(id);
    if (entry?.type === "risk-overlay") return false;
    const applies = entry?.appliesToProfiles;
    return Array.isArray(applies) && applies.length > 0 && !applies.some((profile) => profiles.includes(profile));
  });
  if (profileIncompatibleIndustrial.length > 0) {
    throw new Error(`Industrial pack(s) incompatible with selected profiles ${profiles.join(", ")}: ${profileIncompatibleIndustrial.join(", ")}`);
  }
  if (baselineLevel === "BL2_INDUSTRIAL") {
    const selectedIndustrialEntries = industrialPacks.map((id) => industrialById.get(id)).filter(Boolean);
    const uncovered = profiles.filter((profile) => !selectedIndustrialEntries.some((entry) => {
      return (entry.appliesToProfiles || []).includes(profile);
    }));
    if (uncovered.length > 0) {
      throw new Error(`Industrial baseline has no platform/capability pack for selected profile(s): ${uncovered.join(", ")}`);
    }
  }

  const evidencePending = standardPacks.some((id) => standardById.get(id)?.requiresEvidenceForConfirmed === true)
    || industrialPacks.some((id) => (industrialById.get(id)?.maturityStage || industrialById.get(id)?.status) !== "stable");
  const selectedEnvironmentPacks = standardPacks.filter((id) => standardById.get(id)?.type === "environment");
  const environmentBaselineRequired = ["BL1_STANDARD", "BL2_INDUSTRIAL"].includes(baselineLevel);
  const environmentBaselineStatus = !environmentBaselineRequired
    ? "NOT_REQUIRED"
    : selectedEnvironmentPacks.length === 0
      ? "PACK_NOT_SELECTED"
      : selectedEnvironmentPacks.some((id) => standardById.get(id)?.requiresEvidenceForConfirmed === true)
        ? "EVIDENCE_INCOMPLETE"
        : "READY";
  const configured = Boolean(baselineLevel && profiles.length > 0);
  const strictStatus = !configured
    ? technicalSelectionStatus
    : evidencePending || environmentBaselineStatus === "PACK_NOT_SELECTED"
      ? "EVIDENCE_INCOMPLETE"
      : "BASELINE_READY";

  return {
    configured,
    baselineLevel,
    profiles,
    standardPacks,
    industrialPacks,
    standardPackMaturity: Object.fromEntries(standardPacks.map((id) => [id, standardById.get(id)?.maturityStage || standardById.get(id)?.status || "unknown"])),
    industrialPackMaturity: Object.fromEntries(industrialPacks.map((id) => [id, industrialById.get(id)?.maturityStage || industrialById.get(id)?.status || "unknown"])),
    industrialPackCompatibility,
    evidencePending,
    strictStatus,
    selectionStatus: configured ? "SELECTED" : technicalSelectionStatus,
    satisfactionStatus: strictStatus,
    ready: strictStatus === "BASELINE_READY",
    technicalSelection: {
      status: technicalSelectionStatus,
      userInputRequired: false,
      nextAction: technicalSelectionStatus === "TECHNICAL_DISCOVERY_REQUIRED"
        ? "CODEX_CONTINUE_PROJECT_INSPECTION"
        : configured
          ? "CODEX_VERIFY_BASELINE_SATISFACTION"
          : "CODEX_CONTINUE_TECHNICAL_SELECTION",
    },
    environmentBaseline: {
      required: environmentBaselineRequired,
      selectedPacks: selectedEnvironmentPacks,
      status: environmentBaselineStatus,
      determinedBy: "CODEX_PROJECT_EVIDENCE",
    },
    goal: String(options.goal || "").trim() || null,
    goalProfileSignals: goalProjection.signals,
    goalProfileNegatedSignals: goalProjection.negatedSignals,
    goalProfileContextualSignals: goalProjection.contextualSignals,
    codexFallbackProfiles,
    nonPlatformTechnicalDiscovery,
    projectEvidence,
    projectBinding: {
      targetPath: projectEvidence.projectRoot,
      declaredExistingProject: typeof options.existingProject === "boolean" ? options.existingProject : null,
      effectiveExistingProject: existingProject,
    },
    baselineDemand,
  };
}

function bullets(values, empty = "- None") {
  return values.length > 0 ? values.map((value) => `- ${value}`).join("\n") : empty;
}

export function renderProjectProfile(config, options = {}) {
  const technicalDiscoveryPending = !config.configured;
  const technicalStatus = technicalDiscoveryPending ? "TECHNICAL_DISCOVERY_REQUIRED" : "CONFIRMED";
  const platformSummary = config.profiles.length > 0 ? config.profiles.join(", ") : "TECHNICAL_DISCOVERY_REQUIRED";
  const baselineSummary = config.baselineLevel || "TECHNICAL_DISCOVERY_REQUIRED";
  const goalSignalSummary = config.goalProfileSignals?.length > 0
    ? config.goalProfileSignals.map((item) => `${item.profile} (${item.matched.join(", ")})`).join("; ")
    : config.profiles?.length > 0
      ? `${config.profiles.join(", ")} is the controlled-plan profile selection; no conflicting platform signal was present`
      : "starter/profile evidence; no unambiguous platform token was required";
  const negatedSignalSummary = config.goalProfileNegatedSignals?.length > 0
    ? config.goalProfileNegatedSignals.map((item) => `${item.profile} (${item.matched.join(", ")})`).join("; ")
    : "none";
  return `# Project Profile: ${options.projectName || "project"}

## Status

Draft status: ${technicalStatus}

Technical configuration status: ${technicalStatus}

## Project Type

- Category: IntentOS configured project
- Target platform(s): ${platformSummary}
- Delivery model: ${baselineSummary}
- Expected lifecycle: maintained project

## Selected Profiles

${bullets(config.profiles)}

## Profile Rationale

${technicalDiscoveryPending
    ? "No platform profile has enough evidence yet. Codex must continue project inspection and record the technical selection without delegating it to the user."
    : "The profiles were derived by Codex from the selected starter/project goal and are bound to the controlled initialization plan."}

Goal platform signals: ${goalSignalSummary}

Explicitly excluded platform signals: ${negatedSignalSummary}

## Purpose

Project purpose remains defined by the product request and business specification.

## Users / Actors

Pending business specification.

## Success Criteria

- Selected platform and baseline assets are installed and verifiable.

## Non-goals

- This profile does not prove product correctness or production readiness.

## Data Sensitivity

- Unknown until the business specification classifies project data.

## Default Task Level

${config.baselineLevel === "BL2_INDUSTRIAL" ? "L2" : "L1"}

Rationale: baseline-aware maintained-project default; task governance may raise it.

## High-risk Boundaries

Stop before production, secrets, permissions, payment, migrations, regulated data, or irreversible operations until Codex has project evidence and the exact external effect has the required real-world consent.

## Required Project Records

- [x] Project profile
- [x] Baseline selection
- [x] Baseline evidence

## Open Assumptions

Business, data, release, and production facts remain pending until supported by project evidence.
`;
}

export function renderBaselineSelection(config) {
  const technicalDiscoveryPending = !config.configured;
  const documentStatus = technicalDiscoveryPending
    ? "TECHNICAL_DISCOVERY_REQUIRED"
    : config.evidencePending ? "PENDING_EVIDENCE" : "CONFIRMED";
  const authorityStatus = technicalDiscoveryPending
    ? "TECHNICAL_DISCOVERY_REQUIRED"
    : config.evidencePending ? "EVIDENCE_PENDING" : "VERIFIED";
  const maturityRows = [
    ...config.standardPacks.map((id) => `| ${id} | standard | ${config.standardPackMaturity[id]} | Codex goal/profile derivation in the controlled plan |`),
    ...config.industrialPacks.map((id) => `| ${id} | industrial | ${config.industrialPackMaturity[id]} | Codex risk/evidence derivation in the controlled plan |`),
  ];
  const goalSignals = config.goalProfileSignals?.length > 0
    ? config.goalProfileSignals.map((item) => `- ${item.profile}: ${item.matched.join(", ")}`).join("\n")
    : config.profiles?.length > 0
      ? `- No conflicting platform token; the controlled plan selected ${config.profiles.join(", ")}.`
      : "- No unambiguous platform token; starter/project evidence remains the source.";
  const negatedGoalSignals = config.goalProfileNegatedSignals?.length > 0
    ? config.goalProfileNegatedSignals.map((item) => `- ${item.profile}: ${item.matched.join(", ")} (${item.reasons.join(", ")})`).join("\n")
    : "- None";
  return `# Baseline Selection

## Status

Draft status: ${documentStatus}

Technical selection status: ${documentStatus}

## Baseline Level

${config.baselineLevel || "TECHNICAL_DISCOVERY_REQUIRED"}

Rationale: ${technicalDiscoveryPending
    ? "Codex has not found enough platform evidence. Technical discovery remains active and is not a user choice."
    : "Codex derived this selection from the project goal, platform evidence, and controlled initialization plan."}

## Selected Profiles

${bullets(config.profiles)}

## Selected Standard Packs

${bullets(config.standardPacks)}

## Selected Industrial Packs

${bullets(config.industrialPacks)}

## Goal Platform Evidence

Product goal: ${config.goal || "Not supplied to this selection call"}

Derived signals:

${goalSignals}

Excluded by explicit negation:

${negatedGoalSignals}

Goal/profile conflict: None. A conflict blocks baseline readiness before this document is generated.

## Baseline Rationale

| Selection | Layer | Maturity | Technical decision source |
|---|---|---|---|
${maturityRows.length > 0 ? maturityRows.join("\n") : "| None | N/A | N/A | N/A |"}

## Technical Selection Authority

Status: ${authorityStatus}

Authority: Codex, bound to the exact IntentOS initialization action graph and project evidence.

User technical decision required: No

## Baseline Exceptions

| Requirement | Exception | Reason | Handling authority | Review date | Disposition evidence |
|---|---|---|---|---|---|
| None recorded | N/A | N/A | Codex | N/A | No |

## Residual Risk Register

| Risk | Impact | Mitigation | Handling authority | Review date | External consent status |
|---|---|---|---|---|---|
| Selected pack maturity may be draft | Baseline guidance is not production certification | Keep maturity visible and require project evidence | Codex | Before release review | Not applicable until an exact external effect is prepared |

## Review Cadence

- Recheck when platform, baseline level, selected packs, production scope, or project authority changes.
`;
}

export function renderBaselineEvidence(config) {
  const technicalDiscoveryPending = !config.configured;
  const evidencePending = technicalDiscoveryPending || config.evidencePending;
  return `# Baseline Evidence

## Decision Summary

Conclusion: ${technicalDiscoveryPending
    ? "baseline selection remains in technical discovery; no platform default has been assumed."
    : "selected baseline configuration is installed through an exact controlled plan."}

Recommended path: ${technicalDiscoveryPending
    ? "Codex continues project inspection, records the technical selection, and then validates baseline satisfaction."
    : "Codex validates the selected baseline and continues project-specific onboarding."}

Can AI continue now: yes for technical setup; external effects remain separately consent-gated

User input boundary: only an unavailable business fact, external fact, product preference, or consent to a prepared real-world effect when it becomes material.

## Human Summary

One-sentence conclusion: ${technicalDiscoveryPending
    ? "IntentOS governance assets are installed, while the platform baseline remains blocked on Codex technical discovery."
    : "IntentOS baseline assets are configured; product and production evidence still belong to the project."}

## Input Boundary

Technical input from the user before Codex continues: No

Decision: ${technicalDiscoveryPending
    ? "technical selection remains pending while Codex gathers project evidence; the choice is not delegated to the user."
    : config.evidencePending ? "selected packs remain pending while Codex gathers required project evidence." : "technical baseline installation may continue; concrete real-world effects remain separately consent-gated."}

## Next Safe Step

Next action: complete product, engineering, environment, and business onboarding using real project evidence.

## Status

Draft status: ${technicalDiscoveryPending ? "TECHNICAL_DISCOVERY_REQUIRED" : evidencePending ? "PENDING_EVIDENCE" : "CONFIRMED"}

User input status: NOT_NEEDED_FOR_TECHNICAL_BASELINE

## Evidence Index

| Requirement | Evidence Type | Evidence Ref | Status | Reason if skipped | Owner | Review date |
|---|---|---|---|---|---|---|
| Project profile | doc | docs/project-profile.md | Done |  | IntentOS apply | On profile change |
| Baseline selection | doc | docs/baseline-selection.md | Done |  | IntentOS apply | On baseline change |
| Managed version | audit | .intentos/version.json | Done |  | IntentOS apply | On workflow update |

## Production Readiness

Status: NOT_AUDITED

## Release Readiness

Status: NOT_AUDITED

## Security Readiness

Status: NOT_AUDITED

## Privacy Readiness

Status: NOT_AUDITED

## Recovery Readiness

Status: NOT_AUDITED

## Exceptions

None recorded.

## Residual Risks

- Pack maturity: ${JSON.stringify({ ...config.standardPackMaturity, ...config.industrialPackMaturity })}
- Installation evidence does not prove product correctness or production readiness.
`;
}

function cleanEnvironmentEvidenceValue(value) {
  const normalized = String(value || "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\s+/g, " ");
  if (!normalized
    || normalized.includes("<")
    || /^(?:unknown|pending|tbd|todo|none|n\/a|not[_ -]?applicable)$/i.test(normalized)) return null;
  return normalized;
}

function firstEnvironmentEvidenceMatch(content, patterns) {
  for (const pattern of patterns) {
    const match = String(content || "").match(pattern);
    const value = cleanEnvironmentEvidenceValue(match?.[1]);
    if (value) return value;
  }
  return null;
}

function pendingEnvironmentFact(profile, topic, source) {
  return {
    profile,
    topic,
    value: "UNKNOWN",
    source,
    status: "PENDING_CONFIRMATION",
  };
}

function confirmedEnvironmentFact(profile, topic, value, source) {
  return {
    profile,
    topic,
    value,
    source,
    status: "CONFIRMED",
  };
}

function environmentFactFromFiles(projectRoot, entries, issues, options) {
  for (const pathPattern of options.pathPatterns) {
    const candidates = entries
      .filter((entry) => entry.type === "file" && pathPattern.test(entry.path))
      .sort((left, right) => left.path.localeCompare(right.path));
    for (const entry of candidates) {
      const content = readTextEvidence(path.join(projectRoot, entry.path), projectRoot, issues, options.maxBytes);
      const value = options.extract(content, entry.path);
      if (value) return confirmedEnvironmentFact(options.profile, options.topic, value, entry.path);
    }
  }
  return pendingEnvironmentFact(options.profile, options.topic, options.missingSource);
}

function iosEnvironmentFacts(projectRoot, entries, issues) {
  const xcode = environmentFactFromFiles(projectRoot, entries, issues, {
    profile: "ios-app",
    topic: "Xcode version",
    pathPatterns: [/(?:^|\/)\.xcode-version$/i],
    extract: (content) => firstEnvironmentEvidenceMatch(content, [/(\d+(?:\.\d+){0,3})/]),
    missingSource: "No project-local .xcode-version evidence",
  });
  const swift = environmentFactFromFiles(projectRoot, entries, issues, {
    profile: "ios-app",
    topic: "Swift version",
    pathPatterns: [
      /(?:^|\/)\.swift-version$/i,
      /(?:^|\/)Package\.swift$/,
      /(?:^|\/)project\.pbxproj$/,
    ],
    extract: (content) => firstEnvironmentEvidenceMatch(content, [
      /swift-tools-version\s*:\s*(\d+(?:\.\d+){0,3})/i,
      /\bSWIFT_VERSION\s*=\s*([0-9]+(?:\.[0-9]+){0,3})\s*;/i,
      /(\d+(?:\.\d+){0,3})/,
    ]),
    missingSource: "No project-local Swift version evidence",
  });
  const schemeEntries = entries
    .filter((entry) => entry.type === "file" && /(?:^|\/)xcshareddata\/xcschemes\/[^/]+\.xcscheme$/i.test(entry.path))
    .sort((left, right) => left.path.localeCompare(right.path));
  const schemes = [...new Set(schemeEntries.map((entry) => path.basename(entry.path, ".xcscheme")))];
  const scheme = schemes.length > 0
    ? confirmedEnvironmentFact(
        "ios-app",
        "scheme",
        schemes.join(", "),
        schemeEntries.map((entry) => entry.path).join(", "),
      )
    : pendingEnvironmentFact("ios-app", "scheme", "No shared .xcscheme project evidence");
  return [xcode, swift, scheme];
}

function androidDeviceEvidenceValue(content) {
  const explicit = firstEnvironmentEvidenceMatch(content, [
    /(?:ANDROID_DEVICE_TARGET|emulator or device target|android device target)\s*[:=]\s*([^\r\n]+)/i,
  ]);
  if (explicit) return explicit;
  const adbDevice = String(content || "").split(/\r?\n/)
    .map((line) => line.trim().match(/^(\S+)\s+device(?:\s|$)/)?.[1])
    .find(Boolean);
  return adbDevice ? `Android device ${adbDevice}` : null;
}

function androidEnvironmentFacts(projectRoot, entries, issues) {
  const jdk = environmentFactFromFiles(projectRoot, entries, issues, {
    profile: "android-app",
    topic: "JDK version",
    pathPatterns: [
      /(?:^|\/)\.java-version$/i,
      /(?:^|\/)\.jdk-version$/i,
      /(?:^|\/)\.tool-versions$/i,
      /(?:^|\/)build\.gradle(?:\.kts)?$/i,
    ],
    extract: (content) => firstEnvironmentEvidenceMatch(content, [
      /^\s*java\s+([^\s#]+)\s*$/im,
      /\bjvmToolchain\s*\(\s*([0-9]+)\s*\)/i,
      /\bJavaVersion\.VERSION_([0-9_]+)/i,
      /(?:sourceCompatibility|targetCompatibility)\s*(?:=|\s)\s*(?:JavaVersion\.VERSION_)?([0-9][0-9_.]*)/i,
      /([0-9]+(?:\.[0-9]+){0,3})/,
    ]),
    missingSource: "No project-local JDK version evidence",
  });
  const gradle = environmentFactFromFiles(projectRoot, entries, issues, {
    profile: "android-app",
    topic: "Gradle version",
    pathPatterns: [/(?:^|\/)gradle\/wrapper\/gradle-wrapper\.properties$/i],
    extract: (content) => firstEnvironmentEvidenceMatch(content, [
      /distributionUrl\s*=.*?gradle-([0-9][A-Za-z0-9_.-]*)-(?:all|bin)\.zip/i,
    ]),
    missingSource: "No Gradle wrapper distribution evidence",
  });
  const agp = environmentFactFromFiles(projectRoot, entries, issues, {
    profile: "android-app",
    topic: "Android Gradle Plugin version",
    pathPatterns: [
      /(?:^|\/)build\.gradle(?:\.kts)?$/i,
      /(?:^|\/)settings\.gradle(?:\.kts)?$/i,
      /(?:^|\/)gradle\/libs\.versions\.toml$/i,
    ],
    extract: (content) => firstEnvironmentEvidenceMatch(content, [
      /\bid\s*\(?\s*["']com\.android\.(?:application|library|dynamic-feature|test)["']\s*\)?\s*version\s*["']([^"']+)["']/i,
      /com\.android\.tools\.build:gradle:([^"'\s)]+)/i,
      /^\s*(?:agp|androidGradlePlugin)\s*=\s*["']([^"']+)["']/im,
    ]),
    missingSource: "No Android Gradle Plugin version evidence",
  });
  const device = environmentFactFromFiles(projectRoot, entries, issues, {
    profile: "android-app",
    topic: "emulator or device target",
    pathPatterns: [
      /(?:^|\/)(?:evidence|environment-evidence)\/[^/]*(?:android[^/]*(?:device|emulator)|(?:device|emulator)[^/]*android)[^/]*\.(?:txt|log|json|md)$/i,
    ],
    extract: androidDeviceEvidenceValue,
    missingSource: "No project-local Android device or emulator command output evidence",
  });
  return [jdk, gradle, agp, device];
}

function resolveEnvironmentToolchainEvidence(config, context) {
  const rootValue = context.projectRoot
    || config.projectBinding?.targetPath
    || config.projectEvidence?.projectRoot
    || "";
  const projectRoot = rootValue ? path.resolve(rootValue) : "";
  const scan = scanProjectEntries(projectRoot, 10, 10_000);
  const profiles = Array.isArray(config.profiles) ? [...new Set(config.profiles)].sort() : [];
  const facts = [];
  for (const profile of profiles) {
    if (profile === "ios-app") facts.push(...iosEnvironmentFacts(projectRoot, scan.entries, scan.issues));
    else if (profile === "android-app") facts.push(...androidEnvironmentFacts(projectRoot, scan.entries, scan.issues));
    else if (profile === "backend-api") facts.push(...backendApiEnvironmentFacts(projectRoot, scan.entries, scan.issues));
    else facts.push(pendingEnvironmentFact(
      profile,
      "product toolchain",
      `No strict environment evidence resolver is defined for selected profile ${profile}`,
    ));
  }
  if (profiles.length === 0) {
    facts.push(pendingEnvironmentFact(
      "unselected",
      "selected profile",
      "No selected profile is available for environment evidence resolution",
    ));
  }
  const missingFacts = facts.filter((fact) => fact.status !== "CONFIRMED");
  const confirmed = missingFacts.length === 0 && scan.issues.length === 0;
  return {
    projectRoot,
    profiles,
    facts,
    missingFacts,
    inspectionIssues: scan.issues,
    status: confirmed ? "CONFIRMED" : "PENDING_CONFIRMATION",
    evidenceStatus: confirmed ? "VERIFIED" : "PENDING_CONFIRMATION",
  };
}

function backendApiEnvironmentFacts(projectRoot, entries, inspectionIssues) {
  const verificationEntry = entries.find((entry) => entry.type === "file" && entry.path === "scripts/verify.sh")?.path;
  if (!projectRoot || !verificationEntry || inspectionIssues.length > 0) {
    return [pendingEnvironmentFact(
      "backend-api",
      "local verification command",
      verificationEntry || "scripts/verify.sh was not found in project-local evidence",
    )];
  }
  const file = path.join(projectRoot, verificationEntry);
  let stat;
  let content;
  try {
    stat = fs.lstatSync(file);
    content = fs.readFileSync(file, "utf8");
  } catch {
    return [pendingEnvironmentFact(
      "backend-api",
      "local verification command",
      `${verificationEntry} could not be read as project-local evidence`,
    )];
  }
  const hasExecutableVerification = stat.isFile()
    && !stat.isSymbolicLink()
    && /^(?:#![^\n]+\n)?[\s\S]*\b(?:node|npm|pnpm|yarn|bun|python\d*|pytest|go\s+test|cargo\s+test|swift\s+test|gradle|mvn|dotnet\s+test|ruby|php)\b/i.test(content);
  if (!hasExecutableVerification) {
    return [pendingEnvironmentFact(
      "backend-api",
      "local verification command",
      `${verificationEntry} does not contain a recognized project-local verification command`,
    )];
  }
  return [{
    profile: "backend-api",
    topic: "local verification command",
    value: "bash scripts/verify.sh",
    source: verificationEntry,
    status: "CONFIRMED",
  }];
}

function environmentMarkdownCell(value) {
  return String(value || "").replaceAll("|", "\\|").replace(/\r?\n/g, " ").trim();
}

export function renderEnvironmentBaseline(config, context = {}) {
  const projectName = String(context.projectName || "project");
  const starter = String(context.starter || "generic-project");
  const toolchain = resolveEnvironmentToolchainEvidence(config, context);
  const profiles = toolchain.profiles.join(", ") || "TECHNICAL_DISCOVERY_REQUIRED";
  const toolchainRows = toolchain.facts.map((fact) => (
    `| ${environmentMarkdownCell(fact.profile)} | ${environmentMarkdownCell(fact.topic)} | ${environmentMarkdownCell(fact.value)} | ${environmentMarkdownCell(fact.source)} | ${fact.status} |`
  )).join("\n");
  const runtimeSummary = toolchain.status === "CONFIRMED"
    ? "Selected-profile toolchain facts are confirmed by the project-local sources listed below."
    : "PENDING_CONFIRMATION until every selected-profile toolchain fact has project-local evidence.";
  const openEnvironmentItems = toolchain.missingFacts.length > 0
    ? [
        "| Item | Classification | Codex recommendation | Evidence needed | Status |",
        "|---|---|---|---|---|",
        ...toolchain.missingFacts.map((fact) => (
          `| ${environmentMarkdownCell(`${fact.profile}: ${fact.topic}`)} | NO_USER_ACTION | inspect project files or run a safe local probe | ${environmentMarkdownCell(fact.source)} | PENDING_CONFIRMATION |`
        )),
      ].join("\n")
    : "No selected-profile toolchain evidence gap blocks local verification.";
  const inspectionSummary = toolchain.inspectionIssues.length > 0
    ? toolchain.inspectionIssues.map((issue) => `- ${issue.message}`).join("\n")
    : "- Project-local evidence inspection completed without read failures.";
  return `# Environment Baseline

## Human Summary

${projectName} uses project-local IntentOS scripts for governed setup and verification. Selected-profile toolchain claims are derived only from project-local evidence; the selected starter does not confirm host tools. No production, paid-service, secret, or external-account effect is authorized by this baseline.

## Status

Baseline status: ${toolchain.status}

Evidence status: ${toolchain.evidenceStatus}

Technical authority: Codex, derived from the selected profiles and the project-local evidence sources listed below.

User technical choice required: No

## Scope

Applies to:

- project-local IntentOS scripts and evidence checks;
- selected profiles: ${profiles};
- starter: ${starter}.

Does not apply to:

- external deployment, production data, paid services, real-user communication, or provider accounts; those effects are NOT_APPLICABLE to this initialization action.

## Local Development

Runtime: ${runtimeSummary}

Package manager: project metadata and lockfiles are authoritative; initialization does not infer a package manager.

Install command: NOT_APPLICABLE for the governance-only starter.

Dev command: NOT_APPLICABLE for the governance-only starter; product runtime commands belong to the project implementation.

Local test command: bash scripts/verify.sh.

Known local dependencies: see the selected-profile evidence table; no host tool version is inferred from the starter.

## Runtime Versions

| Profile | Topic | Value | Source | Status |
|---|---|---|---|---|
${toolchainRows}

Evidence inspection:

${inspectionSummary}

## Package Manager And Lockfile

Package manager: NOT_APPLICABLE until product package metadata exists.

Lockfile: NOT_APPLICABLE until the project installs dependencies and records its generated lockfile.

Policy: use the package metadata and project-local lockfile when one exists; do not silently change package managers.

Codex may change dependencies: only inside the current task boundary with project-native verification and evidence.

## Environment Variables

| Name | Required? | Environment | Secret? | Source | Status |
|---|---|---|---|---|---|
| None for IntentOS local governance | No | local | No | installed workflow assets | NOT_APPLICABLE |

## Secret Boundary

Secret values must never be written into this file.

Secret storage: NOT_APPLICABLE to local initialization.

Codex must not create, expose, copy, or commit credentials, private keys, service-account files, production tokens, or connection strings with embedded credentials.

## External Services

| Service | Used for | Environment | Status |
|---|---|---|---|
| None required by local IntentOS initialization | local governance | local | NOT_APPLICABLE |

## Test Environment

Test command: bash scripts/verify.sh.

Test data policy: project-local fixtures only; no production data.

Service policy: project-native tools provide execution; IntentOS validates their current evidence.

CI test command: bash scripts/verify.sh.

CI execution policy: run the project-local verification command when CI is explicitly configured by the project.

## Preview / Staging / Production

| Environment | Exists for this action? | Reference | Deploy command | Rollback path | Status |
|---|---|---|---|---|---|
| Preview | No | local initialization only | NOT_APPLICABLE | controlled apply rollback | NOT_APPLICABLE |
| Staging | No | local initialization only | NOT_APPLICABLE | controlled apply rollback | NOT_APPLICABLE |
| Production | No | local initialization only | NOT_APPLICABLE | controlled apply rollback | NOT_APPLICABLE |

## CI / CD

CI system: an opt-in workflow-dispatch template may be installed; hosted execution is not enabled by this baseline.

Required checks: bash scripts/verify.sh before a governed project handoff; product-native checks join this command when product code exists.

Build command: NOT_APPLICABLE for the governance-only starter.

Deploy command: NOT_APPLICABLE.

Codex may modify CI: No.

## Release Process

Release path: NOT_APPLICABLE to this initialization action.

Release consent: required only for a later prepared external publication or production effect.

Evidence required: current project, task, source, verification, and release evidence when a release task exists.

## Rollback Process

Rollback path: restore only files owned by the exact controlled apply transaction.

Rollback evidence: apply journal, pre-write hashes, action results, and apply receipt.

Rollback scope: never remove unrelated project files or shared resources.

## Logs / Monitoring / Alerts

Logs: project-local command output and structured IntentOS evidence.

Metrics: NOT_APPLICABLE to initialization.

Alerts: NOT_APPLICABLE to initialization.

Evidence refs: controlled plan, readiness record, transaction journal, and apply receipt.

## Open Environment Decisions

${openEnvironmentItems}

Any future production, provider, cost, secret, or real-user effect is outside this action and must be derived from current project evidence before exact real-world consent is requested.
`;
}
