# AUTO GENERATED FILE - DO NOT EDIT

#' @export
otherComponent <- function(id=NULL, label=NULL, value=NULL) {
    
    props <- list(id=id, label=label, value=value)
    if (length(props) > 0) {
        props <- props[!vapply(props, is.null, logical(1))]
    }
    component <- list(
        props = props,
        type = 'OtherComponent',
        namespace = 'dash_nlp_components',
        propNames = c('id', 'label', 'value'),
        package = 'dashNlpComponents'
        )

    structure(component, class = c('dash_component', 'list'))
}
