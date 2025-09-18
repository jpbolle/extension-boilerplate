// Variables globales
let currentInput = '0';
let operator = null;
let previousInput = null;
let shouldResetDisplay = false;

// Éléments DOM
const display = document.getElementById('display');

// Fonction pour mettre à jour l'affichage
function updateDisplay() {
    display.value = currentInput;
}

// Ajouter un nombre
function appendNumber(number) {
    if (shouldResetDisplay) {
        currentInput = '';
        shouldResetDisplay = false;
    }
    
    if (currentInput === '0' && number !== '.') {
        currentInput = number;
    } else if (number === '.' && currentInput.includes('.')) {
        return; // Empêcher plusieurs points décimaux
    } else {
        currentInput += number;
    }
    
    updateDisplay();
}

// Ajouter un opérateur
function appendOperator(op) {
    if (operator !== null && !shouldResetDisplay) {
        calculate();
    }
    
    operator = op;
    previousInput = currentInput;
    shouldResetDisplay = true;
}

// Calculer le résultat
function calculate() {
    if (operator === null || previousInput === null) {
        return;
    }
    
    let prev = parseFloat(previousInput);
    let current = parseFloat(currentInput);
    let result;
    
    try {
        switch (operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    throw new Error('Division par zéro');
                }
                result = prev / current;
                break;
            default:
                return;
        }
        
        // Limiter le nombre de décimales pour éviter les erreurs de précision
        if (result % 1 !== 0) {
            result = parseFloat(result.toFixed(10));
        }
        
        currentInput = result.toString();
        operator = null;
        previousInput = null;
        shouldResetDisplay = true;
        
    } catch (error) {
        currentInput = 'Erreur';
        operator = null;
        previousInput = null;
        shouldResetDisplay = true;
        
        // Animation d'erreur
        display.classList.add('error');
        setTimeout(() => {
            display.classList.remove('error');
            clearDisplay();
        }, 1500);
    }
    
    updateDisplay();
}

// Effacer tout (Clear)
function clearDisplay() {
    currentInput = '0';
    operator = null;
    previousInput = null;
    shouldResetDisplay = false;
    updateDisplay();
}

// Effacer l'entrée actuelle (Clear Entry)
function clearEntry() {
    currentInput = '0';
    updateDisplay();
}

// Supprimer le dernier caractère
function deleteLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

// Gestion du clavier
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // Empêcher le comportement par défaut pour certaines touches
    if ('0123456789+-*/.=Enter'.includes(key) || key === 'Escape' || key === 'Backspace') {
        event.preventDefault();
    }
    
    // Nombres
    if ('0123456789'.includes(key)) {
        appendNumber(key);
    }
    
    // Point décimal
    if (key === '.') {
        appendNumber('.');
    }
    
    // Opérateurs
    if (key === '+') appendOperator('+');
    if (key === '-') appendOperator('-');
    if (key === '*') appendOperator('*');
    if (key === '/') appendOperator('/');
    
    // Calcul
    if (key === '=' || key === 'Enter') {
        calculate();
    }
    
    // Effacer
    if (key === 'Escape') {
        clearDisplay();
    }
    
    // Supprimer le dernier caractère
    if (key === 'Backspace') {
        deleteLast();
    }
});

// Gestion du focus pour les raccourcis clavier
document.addEventListener('DOMContentLoaded', function() {
    display.focus();
});

// Gestion des événements des boutons (compatible CSP)
document.addEventListener('DOMContentLoaded', function() {
    // Animation au chargement
    const calculator = document.querySelector('.calculator');
    calculator.style.opacity = '0';
    calculator.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
        calculator.style.transition = 'all 0.3s ease';
        calculator.style.opacity = '1';
        calculator.style.transform = 'scale(1)';
    }, 100);

    // Ajout des event listeners pour tous les boutons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            const value = this.getAttribute('data-value');
            
            switch(action) {
                case 'number':
                    appendNumber(value);
                    break;
                case 'operator':
                    appendOperator(value);
                    break;
                case 'calculate':
                    calculate();
                    break;
                case 'clear':
                    clearDisplay();
                    break;
                case 'clear-entry':
                    clearEntry();
                    break;
                case 'delete':
                    deleteLast();
                    break;
            }
        });
    });
});