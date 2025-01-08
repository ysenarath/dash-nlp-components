import dash_text_components as dnc

from dash import Dash, callback, html, Input, Output

app = Dash(__name__)

app.layout = html.Div(
    [
        html.Div(
            [
                dnc.TextInput(id="input", value="my-value", label=""),
                html.Div(id="output"),
            ]
        ),  # Basic usage without attention matrix
        dnc.AttentionHighlight(
            id="attention-viz", tokens=["The", "cat", "sat", "on", "the", "mat"]
        ),
        # Usage with attention matrix
        dnc.AttentionHighlight(
            id="attention-viz-with-weights",
            tokens=["The", "cat", "sat", "on", "the", "mat"],
            attentionMatrix=[
                [1.0, 0.2, 0.1, 0.0, 0.3, 0.1],  # Attention weights for 'The'
                [0.2, 1.0, 0.4, 0.1, 0.1, 0.2],  # Attention weights for 'cat'
                [0.1, 0.4, 1.0, 0.3, 0.0, 0.2],  # Attention weights for 'sat'
                [0.0, 0.1, 0.3, 1.0, 0.2, 0.4],  # Attention weights for 'on'
                [0.3, 0.1, 0.0, 0.2, 1.0, 0.2],  # Attention weights for 'the'
                [0.1, 0.2, 0.2, 0.4, 0.2, 1.0],  # Attention weights for 'mat'
            ],
        ),
    ]
)


@callback(Output("output", "children"), Input("input", "value"))
def display_output(value):
    return "You have entered {}".format(value)


if __name__ == "__main__":
    app.run(debug=True)
