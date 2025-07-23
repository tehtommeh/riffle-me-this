class DeckShuffleVisualizer {
    constructor() {
        this.chart = null;
        this.chordSvg = null;
        this.shuffleSteps = [];
        this.currentStepIndex = 0;
        this.suitColors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
        ];
        
        // Playback state
        this.isPlaying = false;
        this.playbackTimer = null;
        this.playbackSpeed = 1.0; // steps per second
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        document.getElementById('startShuffle').addEventListener('click', () => this.startShuffleSimulation());
        document.getElementById('prevStep').addEventListener('click', () => this.previousStep());
        document.getElementById('nextStep').addEventListener('click', () => this.nextStep());
        document.getElementById('shuffleAlgorithm').addEventListener('change', () => this.updateParameterVisibility());
        document.getElementById('visualizationType').addEventListener('change', () => this.updateVisualization());
        
        // Playback controls
        document.getElementById('playPauseButton').addEventListener('click', () => this.togglePlayback());
        document.getElementById('restartButton').addEventListener('click', () => this.restartPlayback());
        document.getElementById('speedInput').addEventListener('input', (e) => this.updatePlaybackSpeed(e.target.value));
        document.getElementById('speedInput').addEventListener('change', (e) => this.updatePlaybackSpeed(e.target.value));
        
        // Initialize parameter visibility
        this.updateParameterVisibility();
    }
    
    updateParameterVisibility() {
        const algorithm = document.getElementById('shuffleAlgorithm').value;
        
        // Hide all parameter groups
        document.getElementById('alternatingParams').style.display = 'none';
        document.getElementById('riffleParams').style.display = 'none';
        document.getElementById('weaveParams').style.display = 'none';
        document.getElementById('faroParams').style.display = 'none';
        document.getElementById('pileParams').style.display = 'none';
        document.getElementById('spiralParams').style.display = 'none';
        document.getElementById('reverseSectionsParams').style.display = 'none';
        document.getElementById('cutParams').style.display = 'none';
        
        // Hide all algorithm info boxes
        const infoBoxes = document.querySelectorAll('.algorithm-info');
        infoBoxes.forEach(box => box.classList.remove('show'));
        
        // Show relevant parameter group and info box
        switch (algorithm) {
            case 'alternating':
                document.getElementById('alternatingParams').style.display = 'block';
                document.getElementById('alternatingInfo').classList.add('show');
                break;
            case 'alternating-reverse':
                document.getElementById('alternatingParams').style.display = 'block';
                document.getElementById('alternating-reverseInfo').classList.add('show');
                break;
            case 'riffle':
                document.getElementById('riffleParams').style.display = 'block';
                document.getElementById('riffleInfo').classList.add('show');
                break;
            case 'cut':
                document.getElementById('cutParams').style.display = 'block';
                document.getElementById('cutInfo').classList.add('show');
                break;
            case 'fisherman':
                document.getElementById('fishermanInfo').classList.add('show');
                break;
            case 'monkey':
                document.getElementById('monkeyInfo').classList.add('show');
                break;
            case 'weave':
                document.getElementById('weaveParams').style.display = 'block';
                document.getElementById('weaveInfo').classList.add('show');
                break;
            case 'faro':
                document.getElementById('faroParams').style.display = 'block';
                document.getElementById('faroInfo').classList.add('show');
                break;
            case 'pile':
                document.getElementById('pileParams').style.display = 'block';
                document.getElementById('pileInfo').classList.add('show');
                break;
            case 'spiral':
                document.getElementById('spiralParams').style.display = 'block';
                document.getElementById('spiralInfo').classList.add('show');
                break;
            case 'reverse-sections':
                document.getElementById('reverseSectionsParams').style.display = 'block';
                document.getElementById('reverseSectionsInfo').classList.add('show');
                break;
        }
    }
    
    createInitialDeck(cardsPerSuit, numSuits) {
        const deck = [];
        for (let suit = 0; suit < numSuits; suit++) {
            for (let card = 1; card <= cardsPerSuit; card++) {
                deck.push({
                    value: card,
                    suit: suit,
                    originalPosition: deck.length
                });
            }
        }
        return deck;
    }
    
    alternatingTopBottomShuffle(deck, cardsPerMove = 1) {
        const newDeck = [];
        const tempDeck = [...deck];
        let isTop = true;
        
        for (let i = 0; i < tempDeck.length; i += cardsPerMove) {
            const chunk = tempDeck.slice(i, i + cardsPerMove);
            
            if (isTop) {
                // Put on top (beginning of new deck) in reverse order
                for (let j = chunk.length - 1; j >= 0; j--) {
                    newDeck.unshift(chunk[j]);
                }
            } else {
                // Put on bottom (end of new deck)
                newDeck.push(...chunk);
            }
            
            isTop = !isTop;
        }
        
        return newDeck;
    }
    
    alternatingBottomTopShuffle(deck, cardsPerMove = 1) {
        const newDeck = [];
        const tempDeck = [...deck];
        let isBottom = true;
        
        for (let i = 0; i < tempDeck.length; i += cardsPerMove) {
            const chunk = tempDeck.slice(i, i + cardsPerMove);
            
            if (isBottom) {
                // Put on bottom (end of new deck)
                newDeck.push(...chunk);
            } else {
                // Put on top (beginning of new deck) in reverse order
                for (let j = chunk.length - 1; j >= 0; j--) {
                    newDeck.unshift(chunk[j]);
                }
            }
            
            isBottom = !isBottom;
        }
        
        return newDeck;
    }
    
    riffleShuffle(deck, perfectInterleave = true) {
        const deckSize = deck.length;
        const midPoint = Math.floor(deckSize / 2);
        const leftHalf = deck.slice(0, midPoint);
        const rightHalf = deck.slice(midPoint);
        const newDeck = [];
        
        let leftIndex = 0;
        let rightIndex = 0;
        
        if (perfectInterleave) {
            // Perfect interleave: alternating exactly
            while (leftIndex < leftHalf.length || rightIndex < rightHalf.length) {
                if (rightIndex < rightHalf.length) {
                    newDeck.push(rightHalf[rightIndex]);
                    rightIndex++;
                }
                if (leftIndex < leftHalf.length) {
                    newDeck.push(leftHalf[leftIndex]);
                    leftIndex++;
                }
            }
        } else {
            // Imperfect interleave: sometimes take 2 cards from same half
            while (leftIndex < leftHalf.length || rightIndex < rightHalf.length) {
                const takeFromRight = Math.random() > 0.4; // Slightly favor right half
                const numCards = Math.random() > 0.7 ? 2 : 1; // Sometimes take 2 cards
                
                if (takeFromRight && rightIndex < rightHalf.length) {
                    for (let i = 0; i < numCards && rightIndex < rightHalf.length; i++) {
                        newDeck.push(rightHalf[rightIndex]);
                        rightIndex++;
                    }
                } else if (leftIndex < leftHalf.length) {
                    for (let i = 0; i < numCards && leftIndex < leftHalf.length; i++) {
                        newDeck.push(leftHalf[leftIndex]);
                        leftIndex++;
                    }
                }
            }
        }
        
        return newDeck;
    }
    
    monkeyShuffle(deck) {
        const newDeck = [...deck];
        if (newDeck.length <= 1) return newDeck;
        
        // Pick a random position (not the top)
        const randomIndex = Math.floor(Math.random() * (newDeck.length - 1)) + 1;
        const card = newDeck.splice(randomIndex, 1)[0];
        newDeck.unshift(card); // Move to top
        
        return newDeck;
    }
    
    weaveShuffle(deck, skipDistance = 3) {
        const newDeck = [];
        const remaining = [...deck];
        const extracted = [];
        
        // Extract every nth card
        let index = skipDistance - 1; // 0-based indexing
        while (index < remaining.length) {
            extracted.push(remaining.splice(index, 1)[0]);
            index += skipDistance - 1; // Adjust for removed card
        }
        
        // Combine remaining cards with extracted ones
        return [...remaining, ...extracted];
    }
    
    faroShuffle(deck, faroType = 'out') {
        const deckSize = deck.length;
        const midPoint = Math.floor(deckSize / 2);
        const leftHalf = deck.slice(0, midPoint);
        const rightHalf = deck.slice(midPoint);
        const newDeck = [];
        
        if (faroType === 'out') {
            // Out-shuffle: top card stays on top
            for (let i = 0; i < Math.max(leftHalf.length, rightHalf.length); i++) {
                if (i < leftHalf.length) newDeck.push(leftHalf[i]);
                if (i < rightHalf.length) newDeck.push(rightHalf[i]);
            }
        } else {
            // In-shuffle: top card goes to second position
            for (let i = 0; i < Math.max(leftHalf.length, rightHalf.length); i++) {
                if (i < rightHalf.length) newDeck.push(rightHalf[i]);
                if (i < leftHalf.length) newDeck.push(leftHalf[i]);
            }
        }
        
        return newDeck;
    }
    
    
    pileShuffle(deck, pileCount = 3) {
        const piles = Array.from({ length: pileCount }, () => []);
        
        // Deal cards into piles
        deck.forEach((card, index) => {
            piles[index % pileCount].push(card);
        });
        
        // Collect piles in order
        return piles.flat();
    }
    
    spiralShuffle(deck, sequenceType = 'fibonacci') {
        const newDeck = new Array(deck.length);
        let sequence;
        
        // Generate sequence
        switch (sequenceType) {
            case 'fibonacci':
                sequence = this.generateFibonacci(deck.length);
                break;
            case 'powers2':
                sequence = this.generatePowersOf2(deck.length);
                break;
            case 'primes':
                sequence = this.generatePrimes(deck.length);
                break;
            default:
                sequence = this.generateFibonacci(deck.length);
        }
        
        // Place cards according to sequence
        for (let i = 0; i < deck.length; i++) {
            const targetPos = (sequence[i % sequence.length] - 1) % deck.length;
            let pos = targetPos;
            while (newDeck[pos] !== undefined) {
                pos = (pos + 1) % deck.length; // Find next available position
            }
            newDeck[pos] = deck[i];
        }
        
        return newDeck;
    }
    
    reverseSectionsShuffle(deck, sectionCount = 4) {
        const sectionSize = Math.floor(deck.length / sectionCount);
        const newDeck = [];
        
        for (let i = 0; i < sectionCount; i++) {
            const start = i * sectionSize;
            const end = (i === sectionCount - 1) ? deck.length : start + sectionSize;
            const section = deck.slice(start, end);
            newDeck.push(...section.reverse());
        }
        
        return newDeck;
    }
    
    // Helper functions for spiral shuffle
    generateFibonacci(maxCount) {
        const fib = [1, 1];
        while (fib.length < maxCount) {
            fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
        }
        return fib;
    }
    
    generatePowersOf2(maxCount) {
        const powers = [];
        let power = 1;
        while (powers.length < maxCount) {
            powers.push(power);
            power *= 2;
            if (power > maxCount * 2) power = 1; // Reset to avoid huge numbers
        }
        return powers;
    }
    
    generatePrimes(maxCount) {
        const primes = [];
        let num = 2;
        while (primes.length < maxCount) {
            if (this.isPrime(num)) {
                primes.push(num);
            }
            num++;
        }
        return primes;
    }
    
    isPrime(n) {
        if (n < 2) return false;
        for (let i = 2; i <= Math.sqrt(n); i++) {
            if (n % i === 0) return false;
        }
        return true;
    }
    
    cutShuffle(deck, cutPercentage = 50) {
        const deckSize = deck.length;
        const cutPoint = Math.floor((deckSize * cutPercentage) / 100);
        const topHalf = deck.slice(0, cutPoint);
        const bottomHalf = deck.slice(cutPoint);
        
        // Put bottom half on top
        return [...bottomHalf, ...topHalf];
    }
    
    fishermanShuffle(deck) {
        const newDeck = [];
        const tempDeck = [...deck];
        
        // Take cards alternately from top and bottom
        while (tempDeck.length > 0) {
            if (tempDeck.length > 0) {
                newDeck.push(tempDeck.shift()); // Take from top
            }
            if (tempDeck.length > 0) {
                newDeck.push(tempDeck.pop()); // Take from bottom
            }
        }
        
        return newDeck;
    }
    
    isDeckInOriginalOrder(deck) {
        for (let i = 0; i < deck.length; i++) {
            if (deck[i].originalPosition !== i) {
                return false;
            }
        }
        return true;
    }
    
    startShuffleSimulation() {
        const cardsPerSuit = parseInt(document.getElementById('cardsPerSuit').value);
        const numSuits = parseInt(document.getElementById('numSuits').value);
        const algorithm = document.getElementById('shuffleAlgorithm').value;
        
        // Get algorithm parameters
        const cardsPerMove = parseInt(document.getElementById('cardsPerMove').value) || 1;
        const riffleInterleavePerfect = document.getElementById('riffleInterleavePerfect').checked;
        const weaveSkipDistance = parseInt(document.getElementById('weaveSkipDistance').value) || 3;
        const faroType = document.getElementById('faroType').value || 'out';
        const pileCount = parseInt(document.getElementById('pileCount').value) || 3;
        const spiralSequence = document.getElementById('spiralSequence').value || 'fibonacci';
        const sectionCount = parseInt(document.getElementById('sectionCount').value) || 4;
        const cutPosition = parseInt(document.getElementById('cutPosition').value) || 50;
        const maxSteps = parseInt(document.getElementById('maxSteps').value) || 100;
        
        // Validate inputs
        if (cardsPerSuit < 1 || numSuits < 1) {
            alert('Please enter valid numbers for cards per suit and number of suits.');
            return;
        }
        
        // Create initial deck
        let currentDeck = this.createInitialDeck(cardsPerSuit, numSuits);
        this.shuffleSteps = [JSON.parse(JSON.stringify(currentDeck))]; // Deep copy initial state
        
        // Show status
        const statusElement = document.getElementById('status');
        statusElement.style.display = 'block';
        statusElement.className = 'status running';
        statusElement.textContent = 'Running shuffle simulation...';
        
        // Perform shuffles until deck returns to original order or max steps reached
        let stepCount = 0;
        
        do {
            stepCount++;
            
            switch (algorithm) {
                case 'alternating':
                    currentDeck = this.alternatingTopBottomShuffle(currentDeck, cardsPerMove);
                    break;
                case 'alternating-reverse':
                    currentDeck = this.alternatingBottomTopShuffle(currentDeck, cardsPerMove);
                    break;
                case 'riffle':
                    currentDeck = this.riffleShuffle(currentDeck, riffleInterleavePerfect);
                    break;
                case 'cut':
                    currentDeck = this.cutShuffle(currentDeck, cutPosition);
                    break;
                case 'fisherman':
                    currentDeck = this.fishermanShuffle(currentDeck);
                    break;
                case 'monkey':
                    currentDeck = this.monkeyShuffle(currentDeck);
                    break;
                case 'weave':
                    currentDeck = this.weaveShuffle(currentDeck, weaveSkipDistance);
                    break;
                case 'faro':
                    currentDeck = this.faroShuffle(currentDeck, faroType);
                    break;
                case 'pile':
                    currentDeck = this.pileShuffle(currentDeck, pileCount);
                    break;
                case 'spiral':
                    currentDeck = this.spiralShuffle(currentDeck, spiralSequence);
                    break;
                case 'reverse-sections':
                    currentDeck = this.reverseSectionsShuffle(currentDeck, sectionCount);
                    break;
                default:
                    currentDeck = this.alternatingTopBottomShuffle(currentDeck, cardsPerMove);
            }
            
            this.shuffleSteps.push(JSON.parse(JSON.stringify(currentDeck))); // Deep copy
            
        } while (!this.isDeckInOriginalOrder(currentDeck) && stepCount < maxSteps);
        
        // Update status
        if (this.isDeckInOriginalOrder(currentDeck)) {
            statusElement.className = 'status complete';
            statusElement.textContent = `Deck returned to original order after ${stepCount} steps!`;
        } else {
            statusElement.className = 'status running';
            statusElement.textContent = `Reached maximum ${maxSteps} steps. Deck has not returned to original order.`;
        }
        
        // Reset to first step and update UI
        this.currentStepIndex = 0;
        this.updateStepControls();
        this.updateVisualization();
        this.updateChordDiagram();
        
        // Show playback controls
        document.getElementById('unifiedControls').style.display = 'flex';
    }
    
    previousStep() {
        if (this.shuffleSteps.length === 0) return;
        
        // Stop playback if manually navigating
        if (this.isPlaying) {
            this.stopPlayback();
        }
        
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
        } else {
            // Loop back to the end
            this.currentStepIndex = this.shuffleSteps.length - 1;
        }
        
        this.updateStepControls();
        this.updateVisualization();
        this.updateChordDiagram();
    }
    
    nextStep(isAutomatic = false) {
        if (this.shuffleSteps.length === 0) return;
        
        // Stop playback if this is manual navigation
        if (this.isPlaying && !isAutomatic) {
            this.stopPlayback();
        }
        
        if (this.currentStepIndex < this.shuffleSteps.length - 1) {
            this.currentStepIndex++;
        } else {
            // Loop back to the beginning
            this.currentStepIndex = 0;
        }
        
        this.updateStepControls();
        this.updateVisualization();
        this.updateChordDiagram();
    }
    
    updateStepControls() {
        const prevButton = document.getElementById('prevStep');
        const nextButton = document.getElementById('nextStep');
        const currentStepSpan = document.getElementById('currentStep');
        const totalStepsSpan = document.getElementById('totalSteps');
        
        // Never disable buttons since we have looping
        prevButton.disabled = this.shuffleSteps.length === 0;
        nextButton.disabled = this.shuffleSteps.length === 0;
        
        currentStepSpan.textContent = this.currentStepIndex;
        totalStepsSpan.textContent = this.shuffleSteps.length - 1;
    }
    
    updateVisualization() {
        if (this.shuffleSteps.length === 0) return;
        
        const visualizationType = document.getElementById('visualizationType').value;
        
        // Hide all visualizations
        document.getElementById('deckChart').style.display = 'none';
        document.getElementById('scatterChart').style.display = 'none';
        document.getElementById('waveformChart').style.display = 'none';
        document.getElementById('mandalaChart').style.display = 'none';
        document.getElementById('particlesChart').style.display = 'none';
        
        switch (visualizationType) {
            case 'bar':
                this.showBarChart();
                break;
            case 'scatter':
                this.showScatterPlot();
                break;
            case 'waveform':
                this.showWaveform();
                break;
            case 'mandala':
                this.showMandala();
                break;
            case 'particles':
                this.showParticleSystem();
                break;
            default:
                this.showBarChart();
        }
    }
    
    showBarChart() {
        document.getElementById('deckChart').style.display = 'block';
        
        const currentDeck = this.shuffleSteps[this.currentStepIndex];
        const cardValues = currentDeck.map(card => card.value);
        const cardColors = currentDeck.map(card => this.suitColors[card.suit]);
        
        const ctx = document.getElementById('deckChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: currentDeck.map((_, index) => `Pos ${index + 1}`),
                datasets: [{
                    label: 'Card Value',
                    data: cardValues,
                    backgroundColor: cardColors,
                    borderColor: cardColors.map(color => this.darkenColor(color)),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Deck State - Step ${this.currentStepIndex}`
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Card Value'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Position in Deck'
                        }
                    }
                }
            }
        });
    }
    
    showScatterPlot() {
        document.getElementById('scatterChart').style.display = 'block';
        
        const svg = d3.select('#scatterChart');
        svg.selectAll('*').remove();
        
        const currentDeck = this.shuffleSteps[this.currentStepIndex];
        const container = svg.node().parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        svg.attr('width', width).attr('height', height);
        
        const margin = { top: 40, right: 40, bottom: 60, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Create scales
        const xScale = d3.scaleLinear()
            .domain([0, currentDeck.length - 1])
            .range([0, innerWidth]);
        
        const yScale = d3.scaleLinear()
            .domain([1, d3.max(currentDeck, d => d.value)])
            .range([innerHeight, 0]);
        
        // Add cosmic background
        const defs = svg.append('defs');
        const gradient = defs.append('radialGradient')
            .attr('id', 'cosmicBg')
            .attr('cx', '50%')
            .attr('cy', '50%')
            .attr('r', '50%');
        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#1a1a2e')
            .attr('stop-opacity', 1);
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#16213e')
            .attr('stop-opacity', 1);
        
        g.append('rect')
            .attr('width', innerWidth)
            .attr('height', innerHeight)
            .attr('fill', 'url(#cosmicBg)');
        
        // Add twinkling stars
        for (let i = 0; i < 50; i++) {
            g.append('circle')
                .attr('cx', Math.random() * innerWidth)
                .attr('cy', Math.random() * innerHeight)
                .attr('r', Math.random() * 1.5)
                .attr('fill', 'white')
                .attr('opacity', Math.random() * 0.8 + 0.2);
        }
        
        // Plot cards as constellation points
        g.selectAll('.card-star')
            .data(currentDeck)
            .enter()
            .append('circle')
            .attr('class', 'card-star')
            .attr('cx', (d, i) => xScale(i))
            .attr('cy', d => yScale(d.value))
            .attr('r', 6)
            .attr('fill', d => this.suitColors[d.suit])
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .attr('opacity', 0.9);
        
        // Add constellation lines
        for (let i = 0; i < currentDeck.length - 1; i++) {
            g.append('line')
                .attr('x1', xScale(i))
                .attr('y1', yScale(currentDeck[i].value))
                .attr('x2', xScale(i + 1))
                .attr('y2', yScale(currentDeck[i + 1].value))
                .attr('stroke', 'rgba(255,255,255,0.3)')
                .attr('stroke-width', 1);
        }
        
        // Add title
        g.append('text')
            .attr('x', innerWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .style('fill', 'white')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text(`Card Constellation - Step ${this.currentStepIndex}`);
    }
    
    showWaveform() {
        document.getElementById('waveformChart').style.display = 'block';
        
        const svg = d3.select('#waveformChart');
        svg.selectAll('*').remove();
        
        const currentDeck = this.shuffleSteps[this.currentStepIndex];
        const container = svg.node().parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        svg.attr('width', width).attr('height', height);
        
        const margin = { top: 40, right: 40, bottom: 40, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Create audio visualizer background
        g.append('rect')
            .attr('width', innerWidth)
            .attr('height', innerHeight)
            .attr('fill', '#000011');
        
        // Create waveform for each suit
        const suitWaves = {};
        currentDeck.forEach((card, i) => {
            if (!suitWaves[card.suit]) suitWaves[card.suit] = [];
            suitWaves[card.suit].push({ x: i, value: card.value });
        });
        
        const xScale = d3.scaleLinear()
            .domain([0, currentDeck.length - 1])
            .range([0, innerWidth]);
        
        const yScale = d3.scaleLinear()
            .domain([1, d3.max(currentDeck, d => d.value)])
            .range([innerHeight, 0]);
        
        // Draw frequency bars like audio visualizer
        const barWidth = innerWidth / currentDeck.length;
        currentDeck.forEach((card, i) => {
            const barHeight = (card.value / d3.max(currentDeck, d => d.value)) * innerHeight;
            const color = this.suitColors[card.suit];
            
            // Create glowing effect
            const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
            const filter = defs.append('filter')
                .attr('id', `glow-${i}`)
                .attr('x', '-50%')
                .attr('y', '-50%')
                .attr('width', '200%')
                .attr('height', '200%');
            
            filter.append('feGaussianBlur')
                .attr('stdDeviation', '3')
                .attr('result', 'coloredBlur');
            
            const feMerge = filter.append('feMerge');
            feMerge.append('feMergeNode').attr('in', 'coloredBlur');
            feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
            
            g.append('rect')
                .attr('x', i * barWidth)
                .attr('y', innerHeight - barHeight)
                .attr('width', barWidth - 1)
                .attr('height', barHeight)
                .attr('fill', color)
                .attr('filter', `url(#glow-${i})`)
                .attr('opacity', 0.8);
        });
        
        // Add title
        g.append('text')
            .attr('x', innerWidth / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('fill', 'white')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text(`Audio Waveform - Step ${this.currentStepIndex}`);
    }
    
    showMandala() {
        document.getElementById('mandalaChart').style.display = 'block';
        
        const svg = d3.select('#mandalaChart');
        svg.selectAll('*').remove();
        
        const currentDeck = this.shuffleSteps[this.currentStepIndex];
        const container = svg.node().parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        svg.attr('width', width).attr('height', height);
        
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) * 0.4;
        
        const g = svg.append('g');
        
        // Create mandala background
        g.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', '#1a1a2e');
        
        // Draw concentric circles
        for (let i = 1; i <= 5; i++) {
            g.append('circle')
                .attr('cx', centerX)
                .attr('cy', centerY)
                .attr('r', (maxRadius / 5) * i)
                .attr('fill', 'none')
                .attr('stroke', 'rgba(255,255,255,0.1)')
                .attr('stroke-width', 1);
        }
        
        // Place cards in mandala pattern
        currentDeck.forEach((card, i) => {
            const angle = (i / currentDeck.length) * 2 * Math.PI;
            const radius = (card.value / d3.max(currentDeck, d => d.value)) * maxRadius;
            
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Draw petal-like shapes
            const petalSize = 3 + card.value * 0.5;
            const color = this.suitColors[card.suit];
            
            // Create flower petal path
            const petalPath = `M ${x} ${y - petalSize} 
                             Q ${x + petalSize} ${y} ${x} ${y + petalSize}
                             Q ${x - petalSize} ${y} ${x} ${y - petalSize} Z`;
            
            g.append('path')
                .attr('d', petalPath)
                .attr('fill', color)
                .attr('stroke', 'white')
                .attr('stroke-width', 0.5)
                .attr('opacity', 0.8)
                .attr('transform', `rotate(${angle * 180 / Math.PI}, ${x}, ${y})`);
            
            // Add connecting lines to center
            g.append('line')
                .attr('x1', centerX)
                .attr('y1', centerY)
                .attr('x2', x)
                .attr('y2', y)
                .attr('stroke', 'rgba(255,255,255,0.2)')
                .attr('stroke-width', 0.5);
        });
        
        // Central point
        g.append('circle')
            .attr('cx', centerX)
            .attr('cy', centerY)
            .attr('r', 5)
            .attr('fill', 'white')
            .attr('opacity', 0.8);
        
        // Add title
        g.append('text')
            .attr('x', centerX)
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .style('fill', 'white')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text(`Mandala Pattern - Step ${this.currentStepIndex}`);
    }
    
    showParticleSystem() {
        document.getElementById('particlesChart').style.display = 'block';
        
        const canvas = document.getElementById('particlesChart');
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        const currentDeck = this.shuffleSteps[this.currentStepIndex];
        
        // Clear canvas
        ctx.fillStyle = '#000022';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Create particle system
        const particles = currentDeck.map((card, i) => ({
            x: (i / currentDeck.length) * canvas.width,
            y: canvas.height / 2,
            targetX: (i / currentDeck.length) * canvas.width,
            targetY: canvas.height / 2 + (card.value - 7) * 20,
            vx: 0,
            vy: 0,
            size: 2 + card.value * 0.5,
            color: this.suitColors[card.suit],
            card: card
        }));
        
        // Animate particles
        const animate = () => {
            ctx.fillStyle = 'rgba(0,0,34,0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach((particle, i) => {
                // Physics - attraction to target position
                const dx = particle.targetX - particle.x;
                const dy = particle.targetY - particle.y;
                particle.vx += dx * 0.001;
                particle.vy += dy * 0.001;
                
                // Damping
                particle.vx *= 0.95;
                particle.vy *= 0.95;
                
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Draw particle with glow
                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size * 2
                );
                gradient.addColorStop(0, particle.color);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw core
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw connections to nearby particles
                particles.forEach((other, j) => {
                    if (i !== j) {
                        const dist = Math.sqrt(
                            Math.pow(particle.x - other.x, 2) + 
                            Math.pow(particle.y - other.y, 2)
                        );
                        if (dist < 100) {
                            ctx.strokeStyle = `rgba(255,255,255,${0.3 * (1 - dist/100)})`;
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(particle.x, particle.y);
                            ctx.lineTo(other.x, other.y);
                            ctx.stroke();
                        }
                    }
                });
            });
            
            // Add title
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Particle System - Step ${this.currentStepIndex}`, canvas.width / 2, 30);
        };
        
        // Run one frame of animation
        animate();
    }
    
    createPositionMapping(prevStep, currentStep) {
        const mapping = [];
        for (let i = 0; i < currentStep.length; i++) {
            const card = currentStep[i];
            const prevPosition = prevStep.findIndex(c => 
                c.value === card.value && c.suit === card.suit
            );
            mapping.push({
                from: prevPosition,
                to: i,
                card: card
            });
        }
        return mapping;
    }
    
    updateChordDiagram() {
        if (this.shuffleSteps.length < 2 || this.currentStepIndex === 0) {
            this.clearChordDiagram();
            return;
        }
        
        const prevStep = this.shuffleSteps[this.currentStepIndex - 1];
        const currentStep = this.shuffleSteps[this.currentStepIndex];
        const mapping = this.createPositionMapping(prevStep, currentStep);
        
        this.drawChordDiagram(mapping, currentStep.length);
    }
    
    clearChordDiagram() {
        const svg = d3.select('#chordDiagram');
        svg.selectAll('*').remove();
        
        const container = svg.node().parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight - 40; // Account for title
        
        svg.attr('width', width).attr('height', height);
        
        // Add message for initial state
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('fill', '#666')
            .text('Position movement will appear after first shuffle step');
    }
    
    drawChordDiagram(mapping, deckSize) {
        const svg = d3.select('#chordDiagram');
        svg.selectAll('*').remove();
        
        const container = svg.node().parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight - 40; // Account for title
        const radius = Math.min(width, height) / 2 - 50;
        const centerX = width / 2;
        const centerY = height / 2;
        
        svg.attr('width', width).attr('height', height);
        
        const g = svg.append('g')
            .attr('transform', `translate(${centerX},${centerY})`);
        
        // Create circle points
        const angleStep = (2 * Math.PI) / deckSize;
        const points = [];
        
        for (let i = 0; i < deckSize; i++) {
            const angle = i * angleStep - Math.PI / 2; // Start from top
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            points.push({ x, y, index: i, angle });
        }
        
        // Draw circle
        g.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', radius)
            .style('fill', 'none')
            .style('stroke', '#ddd')
            .style('stroke-width', 1);
        
        // Draw position points
        g.selectAll('.position-point')
            .data(points)
            .enter()
            .append('circle')
            .attr('class', 'position-point')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 4)
            .style('fill', '#333')
            .style('stroke', 'white')
            .style('stroke-width', 2);
        
        // Draw position labels
        g.selectAll('.position-label')
            .data(points)
            .enter()
            .append('text')
            .attr('class', 'position-label')
            .attr('x', d => d.x * 1.15)
            .attr('y', d => d.y * 1.15 + 4)
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .style('fill', '#666')
            .text(d => d.index + 1);
        
        // Create curved paths for movements
        const pathGenerator = d3.line()
            .curve(d3.curveBundle.beta(0.85));
        
        // Draw movement arrows
        mapping.forEach(move => {
            if (move.from !== move.to) {
                const fromPoint = points[move.from];
                const toPoint = points[move.to];
                
                // Create curved path through center
                const midX = 0;
                const midY = 0;
                
                const path = g.append('path')
                    .datum([
                        [fromPoint.x, fromPoint.y],
                        [midX, midY],
                        [toPoint.x, toPoint.y]
                    ])
                    .attr('d', pathGenerator)
                    .style('fill', 'none')
                    .style('stroke', this.suitColors[move.card.suit])
                    .style('stroke-width', 2)
                    .style('opacity', 0.7);
                
                // Add arrowheads
                const arrowSize = 6;
                const angle = Math.atan2(toPoint.y - midY, toPoint.x - midX);
                
                g.append('polygon')
                    .attr('points', this.createArrowPoints(toPoint.x, toPoint.y, angle, arrowSize))
                    .style('fill', this.suitColors[move.card.suit])
                    .style('opacity', 0.8);
            }
        });
        
        // Add title with step info
        g.append('text')
            .attr('x', 0)
            .attr('y', -radius - 25)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .style('fill', '#333')
            .text(`Position Changes: Step ${this.currentStepIndex - 1} → Step ${this.currentStepIndex}`);
    }
    
    createArrowPoints(x, y, angle, size) {
        const x1 = x - size * Math.cos(angle - Math.PI / 6);
        const y1 = y - size * Math.sin(angle - Math.PI / 6);
        const x2 = x - size * Math.cos(angle + Math.PI / 6);
        const y2 = y - size * Math.sin(angle + Math.PI / 6);
        
        return `${x},${y} ${x1},${y1} ${x2},${y2}`;
    }
    
    darkenColor(color) {
        // Simple function to darken a hex color for borders
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 30);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 30);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 30);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    // Playback control methods
    togglePlayback() {
        if (this.shuffleSteps.length === 0) return;
        
        if (this.isPlaying) {
            this.stopPlayback();
        } else {
            this.startPlayback();
        }
    }
    
    startPlayback() {
        this.isPlaying = true;
        this.updatePlaybackButton();
        
        const interval = 1000 / this.playbackSpeed; // Convert steps/sec to milliseconds
        this.playbackTimer = setInterval(() => {
            this.nextStep(true); // Pass true to indicate automatic navigation
        }, interval);
    }
    
    stopPlayback() {
        this.isPlaying = false;
        this.updatePlaybackButton();
        
        if (this.playbackTimer) {
            clearInterval(this.playbackTimer);
            this.playbackTimer = null;
        }
    }
    
    restartPlayback() {
        this.stopPlayback();
        this.currentStepIndex = 0;
        this.updateStepControls();
        this.updateVisualization();
        this.updateChordDiagram();
    }
    
    updatePlaybackSpeed(speed) {
        console.log('updatePlaybackSpeed called with:', speed);
        this.playbackSpeed = parseFloat(speed);
        console.log('playbackSpeed set to:', this.playbackSpeed);
        document.getElementById('speedDisplay').textContent = `${speed}x`;
        
        // If currently playing, restart timer with new speed
        if (this.isPlaying) {
            console.log('Restarting playback with new speed');
            this.stopPlayback();
            this.startPlayback();
        }
    }
    
    updatePlaybackButton() {
        const button = document.getElementById('playPauseButton');
        if (this.isPlaying) {
            button.textContent = '⏸ Pause';
            button.className = 'playback-button play-button playing';
        } else {
            button.textContent = '▶ Play';
            button.className = 'playback-button play-button';
        }
    }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DeckShuffleVisualizer();
});