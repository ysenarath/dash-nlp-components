import dash_text_components as dtc

from dash import Dash, callback, html, Input, Output

app = Dash(__name__)

app.layout = html.Div(
    [
        html.H1("Dash Text Components Demo"),
        # Text Input Section
        html.Div(
            [
                html.H2("Text Input Demo"),
                html.Div(
                    [
                        dtc.TextInput(id="input", value="my-value", label=""),
                        html.Div(id="output"),
                    ]
                ),
            ],
            style={"marginBottom": "30px"},
        ),
        # Word Cloud Section
        html.Div(
            [
                html.H2("Word Cloud Demo"),
                dtc.WordCloud(
                    id="word-cloud",
                    words=[
                        {"text": "React", "weight": 10},
                        {"text": "Dash", "weight": 8},
                        {"text": "Python", "weight": 7},
                        {"text": "JavaScript", "weight": 9},
                        {"text": "Data", "weight": 1},
                        {"text": "Visualization", "weight": 8},
                        {"text": "Components", "weight": 7},
                        {"text": "Interactive", "weight": 5},
                        {"text": "Analysis", "weight": 6},
                        {"text": "Web", "weight": 4},
                        {"text": "Development", "weight": 5},
                        {"text": "UI", "weight": 3},
                        {"text": "UX", "weight": 3},
                        {"text": "Design", "weight": 4},
                        {"text": "Code", "weight": 5},
                    ],
                    style={"height": "300px"},
                ),
                html.Div(id="word-cloud-output", style={"marginTop": "10px"}),
            ],
            style={"marginBottom": "30px"},
        ),
        # Attention Highlight Section
        html.Div(
            [
                html.H2("Attention Highlight Demo"),
                dtc.AttentionHighlight(
                    id="attention-viz", tokens=["The", "cat", "sat", "on", "the", "mat"]
                ),
                html.H3("With Attention Matrix"),
                dtc.AttentionHighlight(
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
            ],
            style={"marginBottom": "30px"},
        ),
    ],
    style={"padding": "20px"},
)


@callback(Output("output", "children"), Input("input", "value"))
def display_output(value):
    return "You have entered {}".format(value)


@callback(Output("word-cloud-output", "children"), Input("word-cloud", "clickedWord"))
def display_clicked_word(word):
    if word:
        return f"Clicked word: {word}"
    return ""


if __name__ == "__main__":
    app.run(debug=True)
