async function loadComponent(elementId, path) {
    try {
        const response = await fetch(path);
        const data = await response.text();
        document.getElementById(elementId).innerHTML = data;
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

// Load các components khi trang web được load
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('header', '../components/header/header.html');
    loadComponent('footer', '../components/footer/footer.html');
});
