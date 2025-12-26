const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const DIST_DIR = path.join(__dirname, 'dist');

// dist 폴더 생성
if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
}

// 루트의 HTML 파일들을 그대로 dist로 복사
const htmlFiles = ['index.html', 'about.html', 'process.html', 'fund.html', 'service.html', 'marketing.html', 'post.html', 'policy.html', 'privacy.html'];

htmlFiles.forEach(file => {
    const srcPath = path.join(ROOT_DIR, file);
    const destPath = path.join(DIST_DIR, file);

    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`📄 복사됨: ${file}`);
    }
});

console.log('\n✅ 빌드 완료!');

// sitemap.xml, robots.txt 복사
['sitemap.xml', 'robots.txt'].forEach(file => {
    const src = path.join(ROOT_DIR, file);
    const dest = path.join(DIST_DIR, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`✓ 복사됨: ${file}`);
    }
});

// 이미지 파일들 (png, jpg, svg 등) 복사
const rootFiles = fs.readdirSync(ROOT_DIR);
rootFiles.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp', '.ico'].includes(ext)) {
        const src = path.join(ROOT_DIR, file);
        const dest = path.join(DIST_DIR, file);
        fs.copyFileSync(src, dest);
        console.log(`✓ 복사됨: ${file}`);
    }
});

// css, js, images 폴더 복사
const filesToCopy = ['css', 'js', 'images', 'admin'];
filesToCopy.forEach(folder => {
    const srcFolder = path.join(ROOT_DIR, folder);
    const destFolder = path.join(DIST_DIR, folder);

    if (fs.existsSync(srcFolder)) {
        copyFolderSync(srcFolder, destFolder);
        console.log(`✓ 폴더 복사됨: ${folder}/`);
    }
});

function copyFolderSync(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);
    files.forEach(file => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);

        if (fs.statSync(srcPath).isDirectory()) {
            copyFolderSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

console.log('\n🚀 프로덕션 준비 완료! dist/ 폴더를 배포하세요.');
