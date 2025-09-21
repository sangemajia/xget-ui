// 整合后的JavaScript代码
document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // 可点击块滚动功能
    // ======================
    const clickableBlocks = document.querySelectorAll('.clickable-block');
    clickableBlocks.forEach(block => {
        block.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            scrollToTarget(targetId);
        });
    });
    
    // 检查URL中是否有锚点参数
    const urlParams = new URLSearchParams(window.location.search);
    const anchor = urlParams.get('anchor');
    if (anchor) {
        scrollToTarget(anchor);
    }
    
    // ======================
    // 导航按钮功能
    // ======================
    const backToTopBtn = document.getElementById('backToTopBtn');
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    
    if (backToTopBtn && backToHomeBtn) {
        // 监听滚动事件
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
        
        // 返回顶部功能
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // 返回首页功能
        backToHomeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }

    // ======================
    // 复制代码功能
    // ======================
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        // 保存原始文本
        button.dataset.originalText = button.textContent;
        
        button.addEventListener('click', function() {
            copyCode(this);
        });
    });
});

// ======================
// 通用功能函数
// ======================

// 滚动到目标位置
function scrollToTarget(targetId) {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        // 添加高亮效果
        targetElement.classList.add('highlight');
        
        // 滚动到目标位置
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // 移除高亮效果
        setTimeout(() => {
            targetElement.classList.remove('highlight');
        }, 2000);
        
        // 更新URL
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('anchor', targetId);
        window.history.replaceState(null, '', newUrl);
    }
}

// 复制代码功能 - 完全避免使用navigator.clipboard
function copyCode(button) {
    const codeBlock = button.parentElement;
    const codeElement = codeBlock.querySelector('code');
    const textToCopy = codeElement.textContent;
    
    // 使用传统的复制方法
    fallbackCopy(textToCopy, button);
}

// 回退复制方法 - 现在作为主要复制方法
function fallbackCopy(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopyFeedback(button);
        } else {
            console.error('复制失败');
            showCopyError(button);
        }
    } catch (err) {
        console.error('复制失败:', err);
        showCopyError(button);
    } finally {
        document.body.removeChild(textArea);
    }
}

// 显示复制反馈
function showCopyFeedback(button) {
    // 保存原始文本
    const originalText = button.dataset.originalText || button.textContent;
    
    // 更新按钮文本
    button.textContent = '已复制!';
    
    // 2秒后恢复原始文本
    setTimeout(() => {
        button.textContent = originalText;
    }, 2000);
}

// 显示复制错误
function showCopyError(button) {
    // 保存原始文本
    const originalText = button.dataset.originalText || button.textContent;
    
    // 更新按钮文本
    button.textContent = '复制失败!';
    
    // 2秒后恢复原始文本
    setTimeout(() => {
        button.textContent = originalText;
    }, 2000);
}



