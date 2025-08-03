// 初始化幻灯片索引
let slideIndex = 0;

// 获取所有幻灯片元素
let slides = document.getElementsByClassName("mySlides");

// 获取所有圆点元素
let dots = document.getElementsByClassName("dot");

// 显示指定的幻灯片
function showSlides(n) {
    let i;
    // 如果索引超过幻灯片数量，则循环回到第一张
    if (n > slides.length) {slideIndex = 1}
    // 如果索引小于1，则循环到最后一张
    if (n < 1) {slideIndex = slides.length}
    // 隐藏所有幻灯片
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    // 移除所有圆点的激活状态
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    // 显示当前幻灯片
    slides[slideIndex-1].style.display = "block";  
    // 设置当前圆点为激活状态
    dots[slideIndex-1].className += " active";
}

// 当前显示的幻灯片
function currentSlide(n) {
    showSlides(slideIndex = n);
}

// 显示下一张幻灯片
function nextSlide() {
    showSlides(slideIndex += 1);
}

// 自动切换幻灯片
function autoSlide() {
    nextSlide();
    // 每隔 5 秒切换一次
    setTimeout(autoSlide, 5000); 
}

// 初始化自动切换
autoSlide();
