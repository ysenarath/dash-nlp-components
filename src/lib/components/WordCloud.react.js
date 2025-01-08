import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * WordCloud is a component that displays words with sizes proportional 
 * to their frequencies or weights.
 */
export default class WordCloud extends Component {
    constructor(props) {
        super(props);
        this.containerRef = React.createRef();
        this.state = {
            wordPositions: new Map(),
            containerDimensions: { width: 500, height: 500 }
        };
    }

    componentDidMount() {
        this.setupResizeObserver();
        this.updateContainerDimensions();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.words !== this.props.words || prevProps.style !== this.props.style) {
            this.updateContainerDimensions();
        }
    }

    componentWillUnmount() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    setupResizeObserver() {
        this.resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                if (width !== this.state.containerDimensions.width ||
                    height !== this.state.containerDimensions.height) {
                    this.setState({
                        containerDimensions: { width, height }
                    }, () => {
                        this.calculateWordPositions();
                    });
                }
            }
        });

        if (this.containerRef.current) {
            this.resizeObserver.observe(this.containerRef.current);
        }
    }

    updateContainerDimensions() {
        if (this.containerRef.current) {
            const { width, height } = this.containerRef.current.getBoundingClientRect();
            this.setState({
                containerDimensions: { width, height }
            }, () => {
                this.calculateWordPositions();
            });
        }
    }

    // Deterministic random number generator
    seededRandom(seed) {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    getFontSize(weight, words) {
        const maxWeight = Math.max(...words.map(w => w.weight));
        const minWeight = Math.min(...words.map(w => w.weight));
        const normalized = (weight - minWeight) / (maxWeight - minWeight);
        return 12 + normalized * 16; // Reduced max font size
    }

    // QuadTree class for efficient collision detection
    createQuadTree(bounds) {
        class QuadTree {
            constructor(bounds) {
                this.bounds = bounds;
                this.points = [];
                this.children = null;
                this.maxPoints = 4;
            }

            insert(point) {
                if (!this.contains(point)) return false;

                if (!this.children) {
                    if (this.points.length < this.maxPoints) {
                        this.points.push(point);
                        return true;
                    }
                    this.subdivide();
                }

                if (this.children) {
                    for (const child of this.children) {
                        if (child.insert(point)) return true;
                    }
                }
                return false;
            }

            subdivide() {
                const { x, y, width, height } = this.bounds;
                const w2 = width / 2;
                const h2 = height / 2;

                this.children = [
                    { x, y, width: w2, height: h2 },
                    { x: x + w2, y, width: w2, height: h2 },
                    { x, y: y + h2, width: w2, height: h2 },
                    { x: x + w2, y: y + h2, width: w2, height: h2 }
                ].map(bounds => new QuadTree(bounds));

                for (const point of this.points) {
                    for (const child of this.children) {
                        if (child.insert(point)) break;
                    }
                }
                this.points = [];
            }

            contains(point) {
                const { x, y, width, height } = this.bounds;
                return point.x >= x && point.x < x + width &&
                    point.y >= y && point.y < y + height;
            }

            query(range) {
                const results = [];
                if (!this.intersects(range)) return results;

                if (this.children) {
                    for (const child of this.children) {
                        results.push(...child.query(range));
                    }
                } else {
                    for (const point of this.points) {
                        if (this.pointInRange(point, range)) {
                            results.push(point);
                        }
                    }
                }
                return results;
            }

            intersects(range) {
                const { x, y, width, height } = this.bounds;
                return !(range.x > x + width ||
                    range.x + range.width < x ||
                    range.y > y + height ||
                    range.y + range.height < y);
            }

            pointInRange(point, range) {
                return point.x >= range.x && point.x < range.x + range.width &&
                    point.y >= range.y && point.y < range.y + range.height;
            }
        }

        return new QuadTree(bounds);
    }

    calculateWordPositions() {
        const { words } = this.props;
        const { width: containerWidth, height: containerHeight } = this.state.containerDimensions;
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        const newPositions = new Map();

        // Initialize QuadTree
        const quadTree = this.createQuadTree({
            x: 0,
            y: 0,
            width: containerWidth,
            height: containerHeight
        });

        // Force-directed placement parameters
        const repulsionForce = 150;
        const iterations = 100;
        const minDistance = Math.min(containerWidth, containerHeight) * 0.5;

        const placeWord = (word, fontSize, seed) => {
            // Calculate word dimensions
            const padding = 4; // Minimal padding
            const wordWidth = Math.ceil(word.length * fontSize * 0.6);
            const wordHeight = Math.ceil(fontSize * 1.2);
            const boundingWidth = wordWidth + padding * 2;
            const boundingHeight = wordHeight + padding * 2;

            let bestPosition = null;
            let minCollisions = Infinity;

            // Initial position using golden ratio spiral
            const goldenRatio = (1 + Math.sqrt(5)) / 2;
            let angle = this.seededRandom(seed) * 2 * Math.PI;
            let radius = 0;
            const radiusStep = Math.min(containerWidth, containerHeight) * 0.02; // Reduced step size

            for (let i = 0; i < iterations; i++) {
                radius += radiusStep;
                angle += (2 * Math.PI) / goldenRatio;

                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);

                // Strict boundary checking
                const safetyMargin = 4;
                if (x < boundingWidth / 2 + safetyMargin ||
                    x > containerWidth - boundingWidth / 2 - safetyMargin ||
                    y < boundingHeight / 2 + safetyMargin ||
                    y > containerHeight - boundingHeight / 2 - safetyMargin) {
                    continue;
                }

                // Force-directed adjustments
                let fx = 0, fy = 0;
                const searchRange = repulsionForce * 1.5;
                quadTree.query({
                    x: x - searchRange,
                    y: y - searchRange,
                    width: searchRange * 2,
                    height: searchRange * 2
                }).forEach(other => {
                    const dx = x - other.x;
                    const dy = y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > 0 && distance < searchRange) {
                        const force = repulsionForce * Math.pow(1 - distance / searchRange, 1.5);
                        const scaleFactor = distance < minDistance ? 1.2 : 1;
                        fx += (dx / distance) * force * scaleFactor;
                        fy += (dy / distance) * force * scaleFactor;
                    }
                });

                const adjustedX = x + fx;
                const adjustedY = y + fy;

                // Final boundary check after force adjustments
                if (adjustedX < boundingWidth / 2 + safetyMargin ||
                    adjustedX > containerWidth - boundingWidth / 2 - safetyMargin ||
                    adjustedY < boundingHeight / 2 + safetyMargin ||
                    adjustedY > containerHeight - boundingHeight / 2 - safetyMargin) {
                    continue;
                }

                const collisions = quadTree.query({
                    x: adjustedX - boundingWidth / 2,
                    y: adjustedY - boundingHeight / 2,
                    width: boundingWidth,
                    height: boundingHeight
                }).length;

                if (collisions < minCollisions) {
                    minCollisions = collisions;
                    bestPosition = {
                        left: adjustedX,
                        top: adjustedY,
                        width: boundingWidth,
                        height: boundingHeight
                    };

                    if (minCollisions === 0) break;
                }
            }

            if (bestPosition) {
                quadTree.insert({
                    x: bestPosition.left,
                    y: bestPosition.top,
                    width: bestPosition.width,
                    height: bestPosition.height
                });
            }

            return bestPosition || {
                // Fallback position near center
                left: centerX,
                top: centerY,
                width: boundingWidth,
                height: boundingHeight
            };
        };

        // Sort words by weight to render larger weights first
        const sortedWords = [...words].sort((a, b) => b.weight - a.weight);

        // Calculate positions for all words
        sortedWords.forEach((word, index) => {
            const fontSize = this.getFontSize(word.weight, words);
            const seed = word.text.split('').reduce((acc, char) => acc + char.charCodeAt(0), index * 100);
            const position = placeWord(word.text, fontSize, seed);
            newPositions.set(word.text, { ...position, fontSize });
        });

        this.setState({ wordPositions: newPositions });
    }

    render() {
        const { id, words, setProps, style } = this.props;
        const { containerDimensions, wordPositions } = this.state;
        const { width: containerWidth, height: containerHeight } = containerDimensions;

        // Sort words by weight to maintain consistent rendering order
        const sortedWords = [...words].sort((a, b) => b.weight - a.weight);

        return (
            <div
                id={id}
                ref={this.containerRef}
                style={{
                    position: 'relative',
                    width: `${containerWidth}px`,
                    height: `${containerHeight}px`,
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    ...style
                }}
            >
                {sortedWords.map((word, index) => {
                    const position = wordPositions.get(word.text);
                    if (!position) return null;
                    const { left, top, width, height, fontSize } = position;
                    return (
                        <div
                            key={word.text}
                            style={{
                                position: 'absolute',
                                left: `${left}px`,
                                top: `${top}px`,
                                width: `${width}px`,
                                height: `${height}px`,
                                transform: 'translate(-50%, -50%)',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: `${fontSize}px`,
                                color: `hsl(${(index * 37) % 360}, 70%, 50%)`,
                                cursor: 'pointer',
                                userSelect: 'none',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                borderRadius: '4px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
                                opacity: position ? 1 : 0
                            }}
                            onClick={() => {
                                if (setProps) {
                                    setProps({ clickedWord: word.text });
                                }
                            }}
                        >
                            {word.text}
                        </div>
                    );
                })}
            </div>
        );
    }
}

WordCloud.defaultProps = {
    words: []
};

WordCloud.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * Array of word objects, each containing text and weight.
     * Example: [{ text: "hello", weight: 5 }, { text: "world", weight: 3 }]
     */
    words: PropTypes.arrayOf(
        PropTypes.shape({
            text: PropTypes.string.isRequired,
            weight: PropTypes.number.isRequired
        })
    ),

    /**
     * The word that was clicked in the cloud
     */
    clickedWord: PropTypes.string,

    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func,

    /**
     * Custom CSS styles to apply to the WordCloud container.
     */
    style: PropTypes.object
};
