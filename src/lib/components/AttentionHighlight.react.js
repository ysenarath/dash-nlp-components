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

    render() {
        const { id, tokens, attentionMatrix, setProps } = this.props;
        const { hoveredIndex } = this.state;

        return (
            <div id={id} style={{ lineHeight: '2em' }}>
                {tokens.map((token, index) => {
                    let opacity = 0;
                    if (hoveredIndex === null) {
                        opacity = 0.1; // Light default highlight when nothing is hovered
                    } else if (attentionMatrix && 
                             attentionMatrix[hoveredIndex] && 
                             typeof attentionMatrix[hoveredIndex][index] === 'number') {
                        // Get attention weight for this token when another token is hovered
                        opacity = attentionMatrix[hoveredIndex][index];
                    }

                    return (
                        <span
                            key={index}
                            style={{
                                padding: '0.2em',
                                margin: '0.1em',
                                display: 'inline-block',
                                backgroundColor: `rgba(255, 255, 0, ${opacity})`,
                                transition: 'background-color 0.3s ease',
                                cursor: 'pointer'
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
