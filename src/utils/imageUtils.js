"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageUrl = getImageUrl;
exports.getImageUrls = getImageUrls;
exports.isImageMigrated = isImageMigrated;
exports.getMigratedImagePaths = getMigratedImagePaths;
exports.getMigrationStats = getMigrationStats;
const imageMapping_1 = require("./imageMapping");
function getImageUrl(localPath) {
    if (localPath.startsWith('http://') || localPath.startsWith('https://')) {
        return localPath;
    }
    const normalizedPath = localPath.startsWith('/') ? localPath : `/${localPath}`;
    const ossUrl = imageMapping_1.imageUrlMapping[normalizedPath];
    if (ossUrl) {
        return ossUrl;
    }
    console.warn(`图片URL映射未找到: ${normalizedPath}`);
    return localPath;
}
function getImageUrls(localPaths) {
    return localPaths.map(path => getImageUrl(path));
}
function isImageMigrated(localPath) {
    const normalizedPath = localPath.startsWith('/') ? localPath : `/${localPath}`;
    return normalizedPath in imageMapping_1.imageUrlMapping;
}
function getMigratedImagePaths() {
    return Object.keys(imageMapping_1.imageUrlMapping);
}
function getMigrationStats() {
    const totalMigrated = Object.keys(imageMapping_1.imageUrlMapping).length;
    const categories = {
        avatars: 0,
        photographers: 0,
        locations: 0,
        homepage: 0,
        others: 0
    };
    Object.keys(imageMapping_1.imageUrlMapping).forEach(path => {
        if (path.includes('/头像/')) {
            categories.avatars++;
        }
        else if (path.includes('/摄影师/')) {
            categories.photographers++;
        }
        else if (path.includes('/主页地点图/')) {
            categories.locations++;
        }
        else if (path.includes('/主页横图/')) {
            categories.homepage++;
        }
        else {
            categories.others++;
        }
    });
    return {
        totalMigrated,
        categories
    };
}
exports.default = {
    getImageUrl,
    getImageUrls,
    isImageMigrated,
    getMigratedImagePaths,
    getMigrationStats
};
