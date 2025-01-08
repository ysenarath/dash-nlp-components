import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * AttentionHighlight is a component that displays tokens and highlights related words
 * based on attention weights when hovering over a token.
 */
export default class AttentionHighlight extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hoveredIndex: null
        };
    }

    validateProps() {
        const { tokens, attentionMatrix } = this.props;
        
        if (!attentionMatrix) return true;
        
        // Check matrix dimensions match tokens length
        if (attentionMatrix.length !== tokens.length) {
            console.error('AttentionMatrix rows must match tokens length');
            return false;
        }
        
        // Check each row length and value range
        for (let i = 0; i < attentionMatrix.length; i++) {
            if (!attentionMatrix[i] || attentionMatrix[i].length !== tokens.length) {
                console.error('AttentionMatrix must be square');
                return false;
            }
            for (let j = 0; j < attentionMatrix[i].length; j++) {
                if (typeof attentionMatrix[i][j] !== 'number' || 
                    attentionMatrix[i][j] < 0 || 
                    attentionMatrix[i][j] > 1) {
                    console.error('AttentionMatrix values must be numbers between 0 and 1');
                    return false;
                }
            }
        }
        return true;
    }

    getHighlightColor(index, hoveredIndex, attentionWeight) {
        if (!this.validateProps()) return 'transparent';
        
        if (hoveredIndex === null) {
            // Default state: light gray background
            return 'rgba(200, 200, 200, 0.1)';
        }
        
        if (index === hoveredIndex) {
            // Currently hovered token: blue highlight
            return 'rgba(66, 135, 245, 0.3)';
        }
        
        // Related tokens: orange highlight with intensity based on attention
        // Scale up small values for better visibility
        const scaledOpacity = Math.pow(attentionWeight, 0.5) * 0.8;
        return `rgba(255, 165, 0, ${scaledOpacity})`;
    }

    render() {
        const { id, tokens, attentionMatrix, setProps } = this.props;
        const { hoveredIndex } = this.state;

        return (
            <div id={id} style={{ 
                lineHeight: '2em',
                padding: '1em',
                fontFamily: 'sans-serif'
            }}>
                {tokens.map((token, index) => {
                    const attentionWeight = hoveredIndex !== null && attentionMatrix ? 
                        attentionMatrix[hoveredIndex][index] : 0;

                    return (
                        <span
                            key={index}
                            style={{
                                padding: '0.4em 0.6em',
                                margin: '0.2em',
                                display: 'inline-block',
                                backgroundColor: this.getHighlightColor(index, hoveredIndex, attentionWeight),
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                borderRadius: '4px',
                                fontSize: '1em',
                                boxShadow: hoveredIndex === index ? 
                                    '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                            }}
                            onMouseEnter={() => this.setState({ hoveredIndex: index })}
                            onMouseLeave={() => this.setState({ hoveredIndex: null })}
                        >
                            {token}
                        </span>
                    );
                })}
            </div>
        );
    }
}

AttentionHighlight.defaultProps = {
    tokens: [],
    attentionMatrix: null
};

AttentionHighlight.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * Array of tokens to display
     */
    tokens: PropTypes.arrayOf(PropTypes.string),

    /**
     * Matrix of attention weights. Should be a 2D array where attentionMatrix[i][j]
     * represents the attention weight from token i to token j.
     * Values should be between 0 and 1.
     */
    attentionMatrix: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),

    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func
};
