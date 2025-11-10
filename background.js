// Background animation with noticeable nudge/shift effect
function initBackgroundAnimation() {
    const pattern1 = document.getElementById('pattern1');
    const pattern2 = document.getElementById('pattern2');
    const gradient = document.querySelector('.bg-gradient');
    const particles = document.querySelector('.bg-particles');
    const mouseFollower = document.getElementById('mouseFollower');
    
    if (!pattern1 || !pattern2 || !mouseFollower) {
        return;
    }
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let smoothX = mouseX;
    let smoothY = mouseY;
    
    // Handle mouse movement
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Handle mouse leave - smoothly return to center
    document.addEventListener('mouseleave', () => {
        mouseX = window.innerWidth / 2;
        mouseY = window.innerHeight / 2;
    });
    
    // Animation loop with parallax nudge effect
    function animate() {
        // Smooth mouse follower
        smoothX += (mouseX - smoothX) * 0.15;
        smoothY += (mouseY - smoothY) * 0.15;
        
        mouseFollower.style.left = smoothX + 'px';
        mouseFollower.style.top = smoothY + 'px';
        
        // Calculate normalized position (-1 to 1)
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const deltaX = (smoothX - centerX) / centerX;
        const deltaY = (smoothY - centerY) / centerY;
        
        // Parallax effect: different layers move at different speeds
        // Pattern 1 (foreground): moves more
        const moveAmount1 = 80; // pixels
        const translateX1 = deltaX * moveAmount1;
        const translateY1 = deltaY * moveAmount1;
        const rotate1 = deltaX * 3; // degrees
        
        // Pattern 2 (midground): moves less
        const moveAmount2 = 60;
        const translateX2 = deltaX * moveAmount2 * 0.7;
        const translateY2 = deltaY * moveAmount2 * 0.7;
        const rotate2 = -deltaY * 2.5;
        
        // Gradient (background): moves even less for depth
        if (gradient) {
            const moveAmountGrad = 40;
            const translateXGrad = deltaX * moveAmountGrad * 0.5;
            const translateYGrad = deltaY * moveAmountGrad * 0.5;
            gradient.style.transform = `translate(${translateXGrad}px, ${translateYGrad}px)`;
        }
        
        // Particles: subtle movement
        if (particles) {
            const moveAmountPart = 30;
            const translateXPart = deltaX * moveAmountPart * 0.4;
            const translateYPart = deltaY * moveAmountPart * 0.4;
            particles.style.transform = `translate(${translateXPart}px, ${translateYPart}px)`;
        }
        
        // Apply transforms with parallax effect
        pattern1.style.transform = `
            translate(${translateX1}px, ${translateY1}px)
            rotate(${rotate1}deg)
        `;
        
        pattern2.style.transform = `
            translate(${translateX2}px, ${translateY2}px)
            rotate(${rotate2}deg)
        `;
        
        requestAnimationFrame(animate);
    }
    
    // Initialize positions
    mouseFollower.style.left = smoothX + 'px';
    mouseFollower.style.top = smoothY + 'px';
    
    animate();
}

// Initialize background animation when page loads
window.addEventListener('load', initBackgroundAnimation);

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Reset mouse position to center on resize
        const mouseFollower = document.getElementById('mouseFollower');
        if (mouseFollower) {
            mouseFollower.style.transition = 'left 0.5s ease, top 0.5s ease';
            setTimeout(() => {
                if (mouseFollower) {
                    mouseFollower.style.transition = '';
                }
            }, 500);
        }
    }, 250);
});
