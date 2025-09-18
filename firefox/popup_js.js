document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('testBtn');
    
    button.addEventListener('click', function() {
        // Changer le texte du bouton
        button.textContent = '✅ Ça marche !';
        button.style.background = '#28a745';
        
        // Afficher une alerte
        alert('🎉 Félicitations ! Ton extension Firefox fonctionne parfaitement !');
        
        // Optionnel : injecter du contenu dans la page active
        browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
            browser.tabs.executeScript(tabs[0].id, {
                code: 'document.body.style.border = "5px solid orange"; console.log("Extension Firefox active !");'
            });
        });
    });
});