// Mouse interaction for background effects
function initMouseInteraction() {
    const mouseFollower = document.getElementById('mouseFollower');
    const pattern1 = document.getElementById('pattern1');
    const pattern2 = document.getElementById('pattern2');
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;
    
    // Smooth transform origin values
    let smoothOriginX = 50;
    let smoothOriginY = 50;
    
    // Smooth angle values to prevent spasm
    let smoothAngle = 0;
    
    // Get center of viewport for distortion calculations
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Mouse move handler
    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });
    
    // Smooth animation loop
    function animate() {
        // Smooth interpolation for mouse follower (visual only)
        currentX += (targetX - currentX) * 0.25; // More responsive
        currentY += (targetY - currentY) * 0.25;
        
        // Update mouse follower position
        mouseFollower.style.left = currentX + 'px';
        mouseFollower.style.top = currentY + 'px';
        
        // Use ACTUAL mouse position for distortion (not smoothed) - more responsive
        const effectiveX = targetX;
        const effectiveY = targetY;
        
        // Smooth transform origin slightly to prevent jitter, but keep it responsive
        const targetOriginX = Math.max(10, Math.min(90, (effectiveX / window.innerWidth) * 100));
        const targetOriginY = Math.max(10, Math.min(90, (effectiveY / window.innerHeight) * 100));
        // Light smoothing for transform origin only
        smoothOriginX += (targetOriginX - smoothOriginX) * 0.3;
        smoothOriginY += (targetOriginY - smoothOriginY) * 0.3;
        
        pattern1.style.transformOrigin = `${smoothOriginX}% ${smoothOriginY}%`;
        pattern2.style.transformOrigin = `${smoothOriginX}% ${smoothOriginY}%`;
        
        // Calculate position relative to viewport center for distortion direction
        const mouseRelX = effectiveX - centerX;
        const mouseRelY = effectiveY - centerY;
        const mouseDistance = Math.sqrt(mouseRelX * mouseRelX + mouseRelY * mouseRelY);
        
        // Maximum effective distortion radius (200px around mouse - greater area)
        const distortionRadius = 200;
        const maxDistortionDistance = distortionRadius;
        
        // Calculate distortion strength - strongest at mouse, fades with distance
        // Use actual distance, no smoothing needed
        let distortionStrength = 0;
        if (mouseDistance < maxDistortionDistance) {
            const normalizedDist = mouseDistance / maxDistortionDistance;
            distortionStrength = (1 - normalizedDist) * (1 - normalizedDist) * 2.5;
        } else {
            distortionStrength = (maxDistortionDistance / mouseDistance) * 0.05;
        }
        
        // Calculate angle for directional distortion - use actual mouse position
        const targetAngle = Math.atan2(mouseRelY, mouseRelX);
        
        // Smooth angle changes ONLY to prevent spasm when moving in circles
        // Handle angle wrapping (0 to 2π)
        let angleDiff = targetAngle - smoothAngle;
        if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // More responsive angle smoothing - allows fast movement but prevents jumps
        // When angle difference is large (fast movement), be more responsive
        const absAngleDiff = Math.abs(angleDiff);
        const angleSmoothing = absAngleDiff > 1.0 ? 0.4 : 0.25; // Fast movement = more responsive
        smoothAngle += angleDiff * angleSmoothing;
        
        // Normalize angle
        if (smoothAngle > Math.PI) smoothAngle -= 2 * Math.PI;
        if (smoothAngle < -Math.PI) smoothAngle += 2 * Math.PI;
        
        // Create repulsion effect - use actual distortion strength (no smoothing)
        const repulsionStrength = distortionStrength * 90;
        
        // For pattern 1 (diagonal lines) - create strong bending/repulsion effect
        const skewX1 = Math.sin(smoothAngle + Math.PI / 4) * repulsionStrength;
        const skewY1 = Math.cos(smoothAngle + Math.PI / 4) * repulsionStrength;
        
        // 3D perspective for depth and bending
        const perspective1 = 600;
        const rotateX1 = (mouseRelY / window.innerHeight) * distortionStrength * 25;
        const rotateY1 = -(mouseRelX / window.innerWidth) * distortionStrength * 25;
        
        // Scale creates expansion effect around mouse (clamped to prevent disappearing)
        const scale1 = Math.min(1 + distortionStrength * 0.5, 2.0);
        
        // For pattern 2 (dot grid) - stronger distortion
        const skewX2 = Math.cos(smoothAngle) * repulsionStrength;
        const skewY2 = -Math.sin(smoothAngle) * repulsionStrength;
        const rotateX2 = (mouseRelX / window.innerWidth) * distortionStrength * 22;
        const rotateY2 = (mouseRelY / window.innerHeight) * distortionStrength * 22;
        const scale2 = Math.min(1 + distortionStrength * 0.6, 2.2);
        
        // Apply transforms - the transform-origin makes this appear localized
        pattern1.style.transform = `
            perspective(${perspective1}px) 
            rotateX(${rotateX1}deg) 
            rotateY(${rotateY1}deg) 
            skew(${skewX1}deg, ${skewY1}deg) 
            scale(${scale1})
        `;
        pattern2.style.transform = `
            perspective(${perspective1}px) 
            rotateX(${rotateX2}deg) 
            rotateY(${rotateY2}deg) 
            skew(${skewX2}deg, ${skewY2}deg) 
            scale(${scale2})
        `;
        
        requestAnimationFrame(animate);
    }
    
    // Initialize position
    mouseFollower.style.left = currentX + 'px';
    mouseFollower.style.top = currentY + 'px';
    
    animate();
}

// Initialize mouse interaction when page loads
window.addEventListener('load', initMouseInteraction);

