/**
 * @file dom
 * @author shenli （meshenli@gmail.com）
 */
define(function () {

    var dom;

    // https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType

    var NodeType = {
        ELEMENT_NODE: 1,
        DOCUMENT_NODE: 9
    };

    dom = {
        NodeType: NodeType
    };

    return dom;
});
