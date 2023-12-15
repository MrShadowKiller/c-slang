/**
 * C AST Processor Module.
 */

import { getVariableSize } from "~src/common/utils";
import { ProcessingError } from "../errors";
import { CAstRoot } from "~src/c-ast/core";
import { ArithmeticExpression } from "~src/c-ast/arithmetic";
import { ArrayDeclaration, ArrayInitialization } from "~src/c-ast/arrays";

import { FunctionDefinition } from "~src/c-ast/functions";
import { Initialization, VariableDeclaration } from "~src/c-ast/variable";

import { evaluateConstantArithmeticExpression, getVariableTypeOfConstant } from "~src/processor/util";
import { Constant } from "~src/c-ast/constants";

/**
 * Processes the C AST tree generated by parsing, to add additional needed information for certain nodes.
 * @param ast
 * @param sourceCode
 * @returns
 */
export default function process(sourceCode: string, ast: CAstRoot) {
  visit(sourceCode, ast);
  return ast;
}

/**
 * Visitor function for traversing the C AST to process C AST.
 * Will call visit on all the fields of the current node being traversed.
 * @param ast
 * @param sourceCode
 */
function visit(
  sourceCode: string,
  node: any,
  enclosingFunc?: FunctionDefinition,
) {
  if (
    !(
      Array.isArray(node) ||
      (typeof node === "object" && node !== null && "type" in node)
    )
  ) {
    // ignore objects that are not AST nodes OR not an array of nodes
    return;
  }

  // special handling for function definition, so we dont visit parameters
  if (node.type === "FunctionDefinition") {
    const n = node as FunctionDefinition;
    // set the fields for tracking sizes as 0 - they will be incremented as more nodes are visited.
    n.sizeOfLocals = 0;
    // size of parameters can be calculated immediately
    n.sizeOfParameters = n.parameters.reduce(
      (sum, curr) => sum + getVariableSize(curr.variableType),
      0,
    );
    n.sizeOfReturn = n.returnType ? getVariableSize(n.returnType) : 0;

    // update the enclosing function to store reference to this function
    visit(sourceCode, n.body, n);
    return;
  }

  // Special actions for specific node types
  if (node.type === "VariableDeclaration") {
    const n = node as VariableDeclaration;
    if (enclosingFunc) {
      enclosingFunc.sizeOfLocals += getVariableSize(n.variableType);
    }
  } else if (node.type === "ArrayDeclaration") {
    const n = node as ArrayDeclaration;
    if (enclosingFunc) {
      enclosingFunc.sizeOfLocals += getVariableSize(n.variableType) * n.size;
    }
  } else if (node.type === "Initialization") {
    const n = node as Initialization;
    if (enclosingFunc) {
      enclosingFunc.sizeOfLocals += getVariableSize(n.variableType);
    } else {
      // this intialization is global. Needs to be a constant expression, which we can evaluate now
      if (n.value.type === "ArithmeticExpression") {
        n.value = evaluateConstantArithmeticExpression(
          sourceCode,
          n.value as ArithmeticExpression,
        );
      }
    }
  } else if (node.type === "ArrayInitialization") {
    const n = node as ArrayInitialization;
    if (enclosingFunc) {
      enclosingFunc.sizeOfLocals += getVariableSize(n.variableType) * n.size;
      n.elements.forEach((e) => visit(sourceCode, e, enclosingFunc));
    } else {
      // this intialization is global. Needs to be a constant expression (assumed), which we can evaluate now
      const evaluatedElements = [];
      for (const element of n.elements) {
        if (element.type === "ArithmeticExpression") {
          evaluatedElements.push(
            evaluateConstantArithmeticExpression(
              sourceCode,
              element as ArithmeticExpression,
            ),
          );
        } else if (element.type === "IntegerConstant") {
          // element is already an integer
          evaluatedElements.push(element);
        } else {
          throw new ProcessingError(
            "Intializer element of global variable is not constant",
            sourceCode,
            node.position,
          );
        }
      }
      n.elements = evaluatedElements;
    }
  } else if (node.isConstant) {
    const n = node as Constant;
    // fill inthe variable type for this node
    n.variableType = getVariableTypeOfConstant(n);
  }

  // visit each child of this node
  for (const k of Object.keys(node)) {
    visit(sourceCode, node[k], enclosingFunc);
  }
}
