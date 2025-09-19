/**
 * ============================================================================
 * Xget URL Converter - Main JavaScript Application
 *
 * A modern web application for converting URLs from supported platforms
 * to the accelerated Xget format. Dynamically loads platform configuration
 * from the official Xget repository.
 *
 * @author Xi Xu
 * @version 1.0.0
 * @since 2025
 * ============================================================================
 */

"use strict";

// ============================================================================
// Global State Management
// ============================================================================

/**
 * Platform configuration data loaded from GitHub
 * @type {Object.<string, string>}
 */
let platformsData = {};

/**
 * Loading state indicator
 * @type {boolean}
 */
let isLoading = false;

// ============================================================================
// DOM Element References
// ============================================================================

/** @type {HTMLInputElement} Original URL input field */
const originalUrlInput = document.getElementById("original-url");

/** @type {HTMLElement} Result section container */
const resultSection = document.getElementById("result-section");

/** @type {HTMLInputElement} Converted URL output field */
const convertedUrlInput = document.getElementById("converted-url");

/** @type {HTMLButtonElement} Copy to clipboard button */
const copyBtn = document.getElementById("copy-btn");

/** @type {HTMLElement} Error message container */
const errorMessage = document.getElementById("error-message");

/** @type {HTMLElement} Platform name display */
const platformName = document.getElementById("platform-name");

/** @type {HTMLElement} Platform detection indicator dot */
const platformDot = document.querySelector(".platform-dot");

/** @type {HTMLElement} Main converter section */
const converterSection = document.querySelector(".converter-section");

// ============================================================================
// Application Initialization
// ============================================================================

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", async () => {
  await loadPlatforms();
  setupEventListeners();

  // Check if the user has chosen not to show the modal again
  const dontShowAgain = localStorage.getItem("dontShowSponsorModal");

  if (!dontShowAgain) {
    // Show the modal after a short delay
    setTimeout(showSponsorModal, 1000);
  }

  // Set up event listeners for modal elements
  setupModalEventListeners();
});

// ============================================================================
// Event Listeners Setup
// ============================================================================

/**
 * Set up all event listeners for the application
 */
function setupEventListeners() {
  originalUrlInput.addEventListener("input", handleUrlInput);
  copyBtn.addEventListener("click", copyToClipboard);

  // Handle paste events with slight delay for processing
  originalUrlInput.addEventListener("paste", (e) => {
    setTimeout(() => handleUrlInput(), 10);
  });
}

// ============================================================================
// Platform Data Management
// ============================================================================

/**
 * Load platform configuration from the official Xget GitHub repository
 * Falls back to a basic platform list if the remote load fails
 * @async
 * @function loadPlatforms
 * @returns {Promise<void>}
 */
async function loadPlatforms() {
  try {
    showLoading("正在加载平台配置...");

    // Fetch platforms.js from the official Xget repository
    //平台配置文件从xget项目github上获取，如果github不稳定，配合xget修改地址
    const response = await fetch( "https://raw.githubusercontent.com/xixu-me/Xget/refs/heads/main/src/config/platforms.js"
    );

    if (!response.ok) {
      throw new Error(
        `获取平台数据失败: ${response.status} ${response.statusText}`
      );
    }

    const fileContent = await response.text();

    // Parse the platform data from the JavaScript file
    platformsData = parsePlatformsData(fileContent);

    if (Object.keys(platformsData).length === 0) {
      throw new Error("在配置文件中未找到平台数据");
    }

    hideError();
  } catch (error) {
    console.error("加载平台失败:", error);
    showError(`加载平台配置失败: ${error.message}`);

    // Fallback to basic platform list if remote loading fails
    platformsData = getFallbackPlatforms();
  }
}

/**
 * Parse platform data from JavaScript file content
 * Extracts the PLATFORMS object using improved regex and parsing logic
 * @param {string} fileContent - Raw JavaScript file content
 * @returns {Object.<string, string>} Parsed platform mappings
 * @throws {Error} When platform data cannot be parsed
 */
function parsePlatformsData(fileContent) {
  try {
    // First, try to find the PLATFORMS export
    const platformsMatch = fileContent.match(
      /export\s+const\s+PLATFORMS\s*=\s*{([\s\S]*?)};/
    );

    if (!platformsMatch) {
      throw new Error("无法在文件中找到 PLATFORMS 对象");
    }

    // Extract the content between the braces
    const platformsContent = platformsMatch[1];

    // Parse the object content more carefully
    const platforms = {};

    // Split by lines and process each line
    const lines = platformsContent.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines, comments, and other non-key-value content
      if (
        !trimmed ||
        trimmed.startsWith("//") ||
        trimmed.startsWith("/*") ||
        trimmed.startsWith("*") ||
        trimmed === "{" ||
        trimmed === "}" ||
        trimmed === "," ||
        !trimmed.includes(":")
      ) {
        continue;
      }

      // Match various key-value patterns
      // Handles: 'key': 'value', "key": "value", key: 'value', key: "value"
      const keyValueMatch = trimmed.match(
        /^['"]?([^'":\s,]+)['"]?\s*:\s*['"]([^'"]+)['"][\s,]*$/
      );

      if (keyValueMatch) {
        const [, key, value] = keyValueMatch;
        // Clean up the key and value
        const cleanKey = key.trim();
        const cleanValue = value.trim();

        // Only add valid HTTP/HTTPS URLs
        if (cleanValue.startsWith("http")) {
          platforms[cleanKey] = cleanValue;
        }
      }
    }

    // Validate that we found some platforms
    if (Object.keys(platforms).length === 0) {
      throw new Error("未能解析出任何平台数据");
    }

    console.log(`成功解析 ${Object.keys(platforms).length} 个平台配置`);
    return platforms;
  } catch (error) {
    console.error("解析平台数据出错:", error);
    throw new Error(`解析平台配置失败: ${error.message}`);
  }
}

/**
 * Get fallback platform data when remote loading fails
 * Provides a basic set of supported platforms
 * @returns {Object.<string, string>} Fallback platform mappings
 */
function getFallbackPlatforms() {
  return {
    gh: "https://github.com",
    gl: "https://gitlab.com",
    hf: "https://huggingface.co",
    npm: "https://registry.npmjs.org",
    pypi: "https://pypi.org",
    conda: "https://repo.anaconda.com",
    sf: "https://sourceforge.net",
    gitea: "https://gitea.com",
    codeberg: "https://codeberg.org",
  };
}

/**
 * Get display name for platform (simplified version)
 * Currently returns the platform key as the display name
 * @param {string} key - Platform key identifier
 * @param {string} url - Platform base URL
 * @returns {string} Display name for the platform
 */
function getPlatformDisplayName(key, url) {
  return key;
}

// ============================================================================
// URL Processing and Validation
// ============================================================================

/**
 * Handle URL input changes with real-time validation and conversion
 * Validates URL format, detects platform, and performs conversion
 * @function handleUrlInput
 */
function handleUrlInput() {
  const url = originalUrlInput.value.trim();

  if (!url) {
    resetPlatformStatus();
    hideError();
    hideResult();
    return;
  }

  if (!isValidUrl(url)) {
    showPlatformError("URL 格式无效");
    hideResult();
    return;
  }

  // Detect platform from URL
  const detectedPlatform = detectPlatform(url);

  if (detectedPlatform) {
    showPlatformDetected(detectedPlatform.key, detectedPlatform.name);
    hideError();
    // Automatically convert the URL in real-time
    performUrlConversion(url, detectedPlatform);
  } else {
    showPlatformError("平台不受支持或无法识别");
    hideResult();
  }
}

/**
 * Validate URL format using the URL constructor
 * @param {string} string - URL string to validate
 * @returns {boolean} True if valid URL format
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect platform from URL by comparing with known platform base URLs
 * Supports hostname matching and subdomain matching
 * @param {string} url - URL to analyze
 * @returns {Object|null} Platform object with key, name, and baseUrl or null if not found
 */
function detectPlatform(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;

    // Special handling for ghcr.io - prioritize cr-ghcr over homebrew-bottles
    if (hostname === "ghcr.io") {
      // Check if it's a homebrew bottles path (contains /v2/homebrew/)
      if (pathname.includes("/v2/homebrew/")) {
        return {
          key: "homebrew-bottles",
          name: getPlatformDisplayName("homebrew-bottles", "https://ghcr.io"),
          baseUrl: "https://ghcr.io",
        };
      } else {
        // Default to cr-ghcr for standard container registry usage
        return {
          key: "cr-ghcr",
          name: getPlatformDisplayName("cr-ghcr", "https://ghcr.io"),
          baseUrl: "https://ghcr.io",
        };
      }
    }

    // Special handling for github.com - prioritize homebrew for Homebrew organization
    if (hostname === "github.com") {
      // Check if it's a Homebrew organization path (starts with /Homebrew or /homebrew/, case-insensitive)
      if (pathname.toLowerCase().startsWith("/homebrew/")) {
        return {
          key: "homebrew",
          name: getPlatformDisplayName(
            "homebrew",
            "https://github.com/Homebrew"
          ),
          baseUrl: "https://github.com/Homebrew",
        };
      } else {
        // Default to gh for standard GitHub usage
        return {
          key: "gh",
          name: getPlatformDisplayName("gh", "https://github.com"),
          baseUrl: "https://github.com",
        };
      }
    }

    // Find matching platform by comparing base URLs
    for (const [key, baseUrl] of Object.entries(platformsData)) {
      try {
        const baseUrlObj = new URL(baseUrl);

        // Direct hostname match
        if (hostname === baseUrlObj.hostname) {
          return {
            key,
            name: getPlatformDisplayName(key, baseUrl),
            baseUrl,
          };
        }

        // Subdomain match (e.g., registry.npmjs.org matches npmjs.org)
        if (hostname.endsWith("." + baseUrlObj.hostname)) {
          return {
            key,
            name: getPlatformDisplayName(key, baseUrl),
            baseUrl,
          };
        }

        // Special case for URLs that might have different subdomains
        const baseDomain = baseUrlObj.hostname.split(".").slice(-2).join(".");
        const urlDomain = hostname.split(".").slice(-2).join(".");

        if (baseDomain === urlDomain && baseDomain.includes(".")) {
          return {
            key,
            name: getPlatformDisplayName(key, baseUrl),
            baseUrl,
          };
        }
      } catch (e) {
        // Skip invalid base URLs
        continue;
      }
    }

    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// URL Conversion Functions
// ============================================================================

/**
 * Convert URL to Xget format with real-time processing
 * Extracts the path from the original URL and constructs the Xget URL
 * Special handling for GitHub blob URLs: automatically converts them to raw URLs
 * Example: /owner/repo/blob/branch/file → /owner/repo/raw/refs/heads/branch/file
 * @param {string} url - Original URL to convert
 * @param {Object} detectedPlatform - Platform object with key, name, and baseUrl
 */
function performUrlConversion(url, detectedPlatform) {
  try {
    const urlObj = new URL(url);

    // Extract the path after the base URL
    let path = urlObj.pathname;

    // For some platforms, we might need to include search params
    if (urlObj.search) {
      path += urlObj.search;
    }

    // Handle special cases where the path might need adjustment
    path = adjustPathForPlatform(path, detectedPlatform.key, urlObj);

    // Convert platform key: replace "-" with "/" in the platform prefix
    const platformPrefix = detectedPlatform.key.replace(/-/g, "/");

    // Construct the Xget URL。此处修改为自己的xget地址
    const xgetUrl = `https://xget.xi-xu.me/${platformPrefix}${path}`;

    // Display the result
    convertedUrlInput.value = xgetUrl;
    showResult();
    hideError();

    // Reset copy button state
    resetCopyButton();
  } catch (error) {
    console.error("转换错误:", error);
    showError(`URL 转换失败: ${error.message}`);
  }
}

/**
 * Adjust path for specific platforms if needed
 * Most platforms can use the path as-is, but special handling can be added
 * @param {string} path - URL path to adjust
 * @param {string} platformKey - Platform key identifier
 * @param {URL} urlObj - Original URL object
 * @returns {string} Adjusted path
 */
function adjustPathForPlatform(path, platformKey, urlObj) {
  // Special handling for GitHub platform - convert blob URLs to raw URLs
  if (platformKey === "gh") {
    // Check if this is a blob URL pattern: /owner/repo/blob/branch/file
    const blobMatch = path.match(/^\/([^\/]+)\/([^\/]+)\/blob\/(.+)$/);
    if (blobMatch) {
      const [, owner, repo, branchAndFile] = blobMatch;

      // Split branch and file path
      // We need to be careful here because branch names can contain slashes
      // For simplicity, we'll assume the first segment is the branch name
      // This works for most common cases like "main", "master", "dev", etc.
      const parts = branchAndFile.split("/");

      if (parts.length >= 2) {
        const branch = parts[0];
        const filePath = parts.slice(1).join("/");

        // Convert to raw URL format: /owner/repo/raw/refs/heads/branch/file
        path = `/${owner}/${repo}/raw/refs/heads/${branch}/${filePath}`;
      } else if (parts.length === 1) {
        // Edge case: only branch name, no file path
        const branch = parts[0];
        path = `/${owner}/${repo}/raw/refs/heads/${branch}/`;
      }
    }
  }

  // Special handling for homebrew platform
  if (platformKey === "homebrew") {
    // Remove /Homebrew or /homebrew from the path (case-insensitive)
    path = path.replace(/^\/[Hh]omebrew/i, "");

    // If path becomes empty, set it to root
    if (!path || path === "/") {
      path = "";
    }
  }

  // Special handling for homebrew-api platform
  if (platformKey === "homebrew-api") {
    // Remove /api from the beginning of the path to avoid duplication
    path = path.replace(/^\/api/i, "");

    // If path becomes empty, set it to root
    if (!path || path === "/") {
      path = "";
    }
  }

  // Ensure path starts with / (except for homebrew and homebrew-api when it should be empty)
  if (!path.startsWith("/") && path !== "") {
    path = "/" + path;
  }

  return path;
}

// ============================================================================
// Clipboard Operations
// ============================================================================

/**
 * Copy converted URL to clipboard with fallback support
 * Uses modern Clipboard API with fallback to document.execCommand
 * @async
 * @function copyToClipboard
 */
async function copyToClipboard() {
  const textToCopy = convertedUrlInput.value;

  if (!textToCopy) {
    return;
  }

  try {
    await navigator.clipboard.writeText(textToCopy);
    showCopySuccess();
  } catch (error) {
    // Fallback for older browsers
    try {
      convertedUrlInput.select();
      document.execCommand("copy");
      showCopySuccess();
    } catch (fallbackError) {
      showError("复制到剪贴板失败。请手动复制。");
    }
  }
}

// ============================================================================
// UI Helper Functions
// ============================================================================

/**
 * Show loading state indicator
 * @param {string} message - Loading message to display
 */
function showLoading(message) {
  isLoading = true;
  // Loading message is handled by platform status indicators
}

/**
 * Reset platform status to initial state
 */
function resetPlatformStatus() {
  platformName.textContent = "将自动检测平台";
  platformDot.className = "platform-dot";
}

/**
 * Show platform detection success state
 * @param {string} key - Platform key identifier
 * @param {string} name - Platform display name
 */
function showPlatformDetected(key, name) {
  platformName.textContent = `已检测到 ${key}`;
  platformDot.className = "platform-dot detected";
}

/**
 * Show platform detection error state
 * @param {string} message - Error message to display
 */
function showPlatformError(message) {
  platformName.textContent = message;
  platformDot.className = "platform-dot error";
}

/**
 * Show the conversion result section
 */
function showResult() {
  resultSection.classList.remove("hidden");
  converterSection.classList.add("has-content");
}

/**
 * Hide the conversion result section
 */
function hideResult() {
  resultSection.classList.add("hidden");
  // Check if there are other content elements (like error messages)
  if (errorMessage.classList.contains("hidden")) {
    converterSection.classList.remove("has-content");
  }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
  converterSection.classList.add("has-content");
}

/**
 * Hide error message
 */
function hideError() {
  errorMessage.classList.add("hidden");
  // Check if there are other content elements (like results)
  if (resultSection.classList.contains("hidden")) {
    converterSection.classList.remove("has-content");
  }
}

/**
 * Show copy success feedback with temporary state change
 */
function showCopySuccess() {
  const originalText = copyBtn.querySelector(".copy-text").textContent;
  const originalIcon = copyBtn.querySelector(".copy-icon").textContent;

  copyBtn.classList.add("copied");
  copyBtn.querySelector(".copy-text").textContent = "已复制!";
  copyBtn.querySelector(".copy-icon").textContent = "✓";

  setTimeout(() => {
    resetCopyButton();
  }, 2000);
}

/**
 * Reset copy button to original state
 */
function resetCopyButton() {
  copyBtn.classList.remove("copied");
  copyBtn.querySelector(".copy-text").textContent = "复制";
  copyBtn.querySelector(".copy-icon").textContent = "📋";
}

// ============================================================================
// Sponsor Popup Modal
// ============================================================================

/**
 * Set up event listeners for the sponsor modal
 */
function setupModalEventListeners() {
  const modal = document.getElementById("sponsor-modal");
  const closeModalButton = document.getElementById("close-modal");
  const dontShowAgainCheckbox = document.getElementById("dont-show-again");

  // Close modal when clicking the X button
  if (closeModalButton) {
    closeModalButton.addEventListener("click", () => {
      closeSponsorModal();
    });
  }

  // Close modal when clicking outside the modal content
  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeSponsorModal();
      }
    });
  }

  // Handle "Don't show again" checkbox
  if (dontShowAgainCheckbox) {
    dontShowAgainCheckbox.addEventListener("change", (event) => {
      if (event.target.checked) {
        localStorage.setItem("dontShowSponsorModal", "true");
      } else {
        localStorage.removeItem("dontShowSponsorModal");
      }
    });
  }
}

/**
 * Show the sponsor modal
 */
function showSponsorModal() {
  const modal = document.getElementById("sponsor-modal");
  if (modal) {
    modal.classList.remove("hidden");
  }
}

/**
 * Close the sponsor modal
 */
function closeSponsorModal() {
  const modal = document.getElementById("sponsor-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// ============================================================================
// Global Error Handling
// ============================================================================

/**
 * Handle unhandled promise rejections globally
 * Provides fallback error handling for async operations
 */
window.addEventListener("unhandledrejection", (event) => {
  console.error("未处理的 promise 拒绝:", event.reason);
  if (!isLoading) {
    showError("发生意外错误。请重试。");
  }
});