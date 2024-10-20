// Note : AST stands for abstract syntactic tree,
// here a tree represention of a subset of HTML (div, text and two kinds of span)
// the XAST stands for eXtended AST, mainly an AST in which we embend a document selection (in the sense of `window.getSelection()`)

export type InlineToken =
    | {
          type: "text";
          content: string; // must be nonempty
      }
    | {
          type: "variable";
          id: string;
          content: InlineToken[];
      }
    | {
          type: "special";
          content: InlineToken[];
      };

export type BlockToken = {
    type: "div";
    content: (InlineToken | BlockToken)[];
};

export type Ast = (InlineToken | BlockToken)[];

export type Caret = {
    type: "caret";
    direction: "start" | "end" | "both";
};

// Let's extend all those types with some carets

export type XTextToken = {
    type: "text";
    content: string; // must be nonempty
    startCaretOffset?: number;
    endCaretOffset?: number;
};

export type XInlineToken =
    | Caret
    | XTextToken
    | {
          type: "variable";
          id: string;
          content: XInlineToken[];
      }
    | {
          type: "special";
          content: XInlineToken[];
      };

export type XBlockToken = {
    type: "div";
    content: (XInlineToken | XBlockToken)[];
};

export type XAst = (XInlineToken | XBlockToken)[];
