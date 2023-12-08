/**
 * Exports a "process" function that can be used to process the AST generated by the parser.
 * Processing involves:
 * 1. Adding scope to each node of the AST. (to serve as an in-built symbol table with lexcial scoping)
 */

import { getVariableSize } from "~src/common/utils";
import { evaluateConstantArithmeticExpression } from "./constants";
import { ProcessingError } from "../errors";
import {
  Root,
  Declaration,
  ScopedNode,
  Block
} from "~src/c-ast/root";
import {
  ArithmeticExpression,
  CompoundAssignment,
  ArithmeticSubExpression,
  PrefixExpression,
  PostfixExpression,
  CompoundAssignmentExpression,
} from "~src/c-ast/arithmetic";
import {
  ArrayDeclaration,
  ArrayInitialization,
  ArrayElementExpr,
} from "~src/c-ast/arrays";
import { Assignment, AssignmentExpression } from "~src/c-ast/assignment";
import {
  ConditionalExpression,
  ComparisonExpression,
  ComparisonSubExpression,
} from "~src/c-ast/boolean";
import {
  FunctionDefinition,
  FunctionDeclaration,
  FunctionCall,
  FunctionCallStatement,
  ReturnStatement,
} from "~src/c-ast/functions";
import { Integer } from "~src/c-ast/literals";
import { DoWhileLoop, WhileLoop, ForLoop } from "~src/c-ast/loops";
import { Variable, Position, Scope } from "~src/c-ast/types";
import {
  Initialization,
  VariableDeclaration,
  VariableExpr,
} from "~src/c-ast/variable";
import { SelectStatement, ConditionalBlock } from "~src/c-ast/select";

function createNewScope(parentScope: Scope | null) {
  return {
    parentScope,
    functions: {},
    variables: {},
    arrays: {},
  };
}

/**
 * Processes the C AST tree generated by parsing, to add information like symbol info.
 * @param ast
 * @param sourceCode
 * @param specialFunctions array of the names of special prebuilt functions, so that calls of these functions will not throw function redeclaration error.
 * @returns
 */
export default function process(
  ast: Root,
  sourceCode: string,
  specialFunctions: string[] = []
) {
  createScopesAndVariables(ast, sourceCode, new Set(specialFunctions));
  return ast;
}

/**
 * Creates the lexical scopes that each node is present in, and links nodes to the scopes they are in.
 * Creates variables that are present in scopes.
 * Performs basic checks:
 *  1. Check for redeclaration of variables and functions
 *  2. Check for existence of a variable during assignment and function call
 *
 * @param ast
 * @param sourceCode
 */
function createScopesAndVariables(
  ast: Root,
  sourceCode: string,
  specialFunctions: Set<string>
) {
  const scopeStack: Scope[] = []; // stores a stack of scopes3

  /**
   * Checks for redeclaration of a variable, throw ProcessingError if redeclaration has occured.
   * @param name name of variable
   * @param sourceCode
   * @param node AST node that the variable is at
   */
  function checkForRedeclaration(
    node:
      | Declaration
      | Initialization
      | FunctionDefinition
      | ArrayDeclaration
      | ArrayInitialization
  ) {
    if (
      node.name in node.scope.variables ||
      node.name in node.scope.functions ||
      node.name in node.scope.arrays
    ) {
      // check for redeclaration
      throw new ProcessingError(
        `Redeclaration error: '${node.name}' redeclared`,
        sourceCode,
        node.position
      );
    }
  }

  /**
   * Gets the function prameters of a function as array of Variable.
   * Throws a redeclaration error if duplicate param names encountered.
   * @param node
   */
  function getFunctionParams(
    node: FunctionDeclaration | FunctionDefinition
  ): Variable[] {
    const s: Record<string, boolean> = {};
    return node.parameters.map((param) => {
      if (param.name in s) {
        throw new ProcessingError(
          `Redeclaration of function parameter ${param.name}`,
          sourceCode,
          node.position
        );
      }
      s[param.name] = true;
      // add the size of the param
      node.sizeOfParameters += getVariableSize(param.variableType);
      return {
        name: param.name,
        type: param.variableType,
      };
    });
  }

  /**
   * Checks if a given variable is declared in the given scope.
   */
  function checkForVariableDeclaration(
    name: string,
    scope: Scope,
    position: Position
  ) {
    let curr = scope;
    while (curr != null) {
      if (name in curr.variables) {
        return curr.variables[name];
      }
      curr = curr.parentScope;
    }
    throw new ProcessingError(
      `Undeclared variable: '${name}' undeclared before use`,
      sourceCode,
      position
    );
  }

  function checkForArrayDeclaration(
    arrayName: string,
    scope: Scope,
    position: Position
  ) {
    let curr = scope;
    while (curr != null) {
      if (arrayName in curr.arrays) {
        return curr.arrays[arrayName];
      }
      curr = curr.parentScope;
    }
    throw new ProcessingError(
      `Undeclared array: '${arrayName}' undeclared before use`,
      sourceCode,
      position
    );
  }

  /**
   * Checks if a given function is declared.
   */
  function checkForFunctionDeclaration(
    node: FunctionCall | FunctionCallStatement
  ) {
    let curr = node.scope;
    if (specialFunctions.has(node.name)) {
      // one of the special pre-built functions
      return;
    }
    while (curr != null) {
      if (node.name in curr.functions) {
        return;
      }
      curr = curr.parentScope;
    }
    throw new ProcessingError(
      `Undeclared function: '${node.name}' undeclared before use`,
      sourceCode,
      node.position
    );
  }

  if (!ast) {
    throw new ProcessingError("No Root AST node found", sourceCode, {
      start: { line: 0, column: 0, offset: 0 },
      end: { line: 0, column: 0, offset: 0 },
    });
  }

  // the visitor function for visiting nodes
  function visit(
    node: ScopedNode,
    enclosingFunc?: FunctionDefinition,
    pre: ScopedNode = null
  ) {
    if (node.type === "Root") {
      const n = node as Root;
      node.scope = createNewScope(null);
      scopeStack.push(node.scope);
      for (const child of n.children) {
        visit(child);
      }
    } else if (node.type === "Block") {
      const n = node as Block;
      if (pre?.type !== "FunctionDefinition") {
        // only create new scope if not a block following a function since function will have created already
        n.scope = createNewScope(scopeStack[scopeStack.length - 1]);
        scopeStack.push(n.scope);
      } else {
        n.scope = scopeStack[scopeStack.length - 1];
      }

      for (const child of n.children) {
        visit(child, enclosingFunc);
      }

      if (pre?.type !== "FunctionDefinition") {
        scopeStack.pop();
      }
    } else if (node.type === "VariableDeclaration") {
      const n = node as VariableDeclaration;
      n.scope = scopeStack[scopeStack.length - 1];
      checkForRedeclaration(n);
      // add this new variable to the scope
      n.scope.variables[n.name] = {
        type: n.variableType,
        name: n.name,
      };
      if (enclosingFunc) {
        enclosingFunc.sizeOfLocals += getVariableSize(n.variableType);
      }
    } else if (node.type === "ArrayDeclaration") {
      const n = node as ArrayDeclaration;
      n.scope = scopeStack[scopeStack.length - 1];
      checkForRedeclaration(n);
      // add this new variable to the scope
      n.scope.arrays[n.name] = {
        type: n.variableType,
        name: n.name,
        size: n.size,
      };
      if (enclosingFunc) {
        enclosingFunc.sizeOfLocals += getVariableSize(n.variableType) * n.size;
      }
    } else if (node.type === "Initialization") {
      const n = node as Initialization;
      n.scope = scopeStack[scopeStack.length - 1];
      checkForRedeclaration(n);
      // add this new variable to the scope
      n.scope.variables[n.name] = {
        type: n.variableType,
        name: n.name,
      };
      if (enclosingFunc) {
        enclosingFunc.sizeOfLocals += getVariableSize(n.variableType);
        visit(n.value, enclosingFunc); // visit like normal if inside a function
      } else {
        // this intialization is global. Needs to be a constant expression (assumed), which we can evaluate now
        if (n.value.type === "ArithmeticExpression") {
          const arithmeticExpression = n.value as ArithmeticExpression;
          if (arithmeticExpression.firstExpr.type !== "Integer") {
            throw new ProcessingError(
              "Intializer element of global variable is not constant",
              sourceCode,
              node.position
            );
          }
          let val = (arithmeticExpression.firstExpr as Integer).value;
          //evaluate the constant arithmetic expression
          for (const operand of arithmeticExpression.exprs) {
            if (operand.expr.type !== "Integer") {
              throw new ProcessingError(
                "Intializer element of global variable is not constant",
                sourceCode,
                node.position
              );
            }
            val = evaluateConstantArithmeticExpression(
              val,
              operand.operator,
              (operand.expr as Integer).value
            );
          }
          n.value = {
            type: "Integer",
            variableType: "int", // TODO: change when support more vartypes
            value: val,
          } as Integer;
        }
      }
    } else if (node.type === "ArrayInitialization") {
      const n = node as ArrayInitialization;
      n.scope = scopeStack[scopeStack.length - 1];
      checkForRedeclaration(n);
      n.scope.arrays[n.name] = {
        type: n.variableType,
        name: n.name,
        size: n.size,
      };
      if (enclosingFunc) {
        enclosingFunc.sizeOfLocals += getVariableSize(n.variableType) * n.size;
        n.elements.forEach((e) => visit(e, enclosingFunc));
      } else {
        // this intialization is global. Needs to be a constant expression (assumed), which we can evaluate now
        const evaluatedElements = [];
        for (const element of n.elements) {
          if (element.type === "ArithmeticExpression") {
            const arithmeticExpression = element as ArithmeticExpression;
            if (arithmeticExpression.firstExpr.type !== "Integer") {
              throw new ProcessingError(
                "Intializer element of global variable is not constant",
                sourceCode,
                node.position
              );
            }
            let val = (arithmeticExpression.firstExpr as Integer).value;
            //evaluate the constant arithmetic expression
            for (const operand of arithmeticExpression.exprs) {
              if (operand.expr.type !== "Integer") {
                throw new ProcessingError(
                  "Intializer element of global variable is not constant",
                  sourceCode,
                  node.position
                );
              }
              val = evaluateConstantArithmeticExpression(
                val,
                operand.operator,
                (operand.expr as Integer).value
              );
            }
            evaluatedElements.push({
              type: "Integer",
              variableType: "int", // TODO: change when support more vartypes
              value: val,
            } as Integer);
          } else if (element.type === "Integer") {
            // element is already an integer
            evaluatedElements.push(element);
          } else {
            throw new ProcessingError(
              "Intializer element of global variable is not constant",
              sourceCode,
              node.position
            );
          }
        }
        n.elements = evaluatedElements;
      }
    } else if (node.type === "FunctionDeclaration") {
      const n = node as FunctionDeclaration;
      n.scope = scopeStack[scopeStack.length - 1];
      checkForRedeclaration(n);
      n.scope.functions[n.name] = {
        returnType: n.returnType,
        name: n.name,
        parameters: getFunctionParams(n),
      };
    } else if (node.type === "FunctionDefinition") {
      const n = node as FunctionDefinition;
      n.sizeOfLocals = 0;
      n.sizeOfParameters = 0;
      n.sizeOfReturn =
        n.returnType !== "void" ? getVariableSize(n.returnType) : 0;
      n.scope = scopeStack[scopeStack.length - 1];
      checkForRedeclaration(n);
      const params = getFunctionParams(n);
      n.scope.functions[n.name] = {
        returnType: n.returnType,
        name: n.name,
        parameters: params,
      };
      // add a new scope just for function variables TODO: see if this is a good idea later
      n.scope = createNewScope(scopeStack[scopeStack.length - 1]);
      scopeStack.push(n.scope);
      params.forEach(
        (param) => (n.scope.variables[param.name] = { ...param, isParam: true })
      );
      // traverse function body nodes
      visit(n.body, n, n);
      scopeStack.pop();
    } else if (
      node.type === "Assignment" ||
      node.type === "CompoundAssignment"
    ) {
      const n = node as Assignment | CompoundAssignment;
      n.scope = scopeStack[scopeStack.length - 1];
      visit(n.variable, enclosingFunc); // visit the variable being assigned
      visit(n.value, enclosingFunc);
    } else if (node.type === "FunctionCall") {
      const n = node as FunctionCall;
      n.scope = scopeStack[scopeStack.length - 1];
      checkForFunctionDeclaration(n);
      n.args.forEach((arg) => visit(arg));
    } else if (node.type === "FunctionCallStatement") {
      const n = node as FunctionCallStatement;
      n.scope = scopeStack[scopeStack.length - 1];
      checkForFunctionDeclaration(n);
      n.args.forEach((arg) => visit(arg));
    } else if (node.type === "VariableExpr") {
      const n = node as VariableExpr;
      n.scope = scopeStack[scopeStack.length - 1];
      const v = checkForVariableDeclaration(n.name, n.scope, n.position);
      n.variableType = v.type;
      n.isParam = v.isParam; // to know if this was a parameter being used in expression
    } else if (node.type === "ArrayElementExpr") {
      const n = node as ArrayElementExpr;
      n.scope = scopeStack[scopeStack.length - 1];
      const v = checkForArrayDeclaration(n.arrayName, n.scope, n.position);
      n.variableType = v.type;
      visit(n.index);
    } else if (node.type === "ArithmeticExpression") {
      const n = node as ArithmeticExpression;
      n.scope = scopeStack[scopeStack.length - 1];
      visit(n.firstExpr, enclosingFunc);
      n.exprs.forEach((expr) => visit(expr));
    } else if (node.type === "ArithmeticSubExpression") {
      const n = node as ArithmeticSubExpression;
      n.scope = scopeStack[scopeStack.length - 1];
      visit(n.expr, enclosingFunc);
    } else if (
      node.type === "PrefixExpression" ||
      node.type === "PostfixExpression"
    ) {
      const n = node as PrefixExpression | PostfixExpression;
      n.scope = scopeStack[scopeStack.length - 1];
      visit(n.variable, enclosingFunc);
    } else if (node.type === "ReturnStatement") {
      const n = node as ReturnStatement;
      n.scope = scopeStack[scopeStack.length - 1];
      if (typeof n.value !== "undefined") {
        visit(n.value, enclosingFunc);
      }
    } else if (node.type === "ConditionalExpression") {
      const n = node as ConditionalExpression;
      n.scope = scopeStack[scopeStack.length - 1];
      n.exprs.forEach((expr) => visit(expr));
    } else if (node.type === "ComparisonExpression") {
      const n = node as ComparisonExpression;
      n.scope = scopeStack[scopeStack.length - 1];
      visit(n.firstExpr, enclosingFunc);
      n.exprs.forEach((expr) => visit(expr));
    } else if (node.type === "ComparisonSubExpression") {
      const n = node as ComparisonSubExpression;
      n.scope = scopeStack[scopeStack.length - 1];
      visit(n.expr, enclosingFunc);
    } else if (node.type === "SelectStatement") {
      const n = node as SelectStatement;
      n.scope = scopeStack[scopeStack.length - 1];
      visit(n.ifBlock, enclosingFunc);
      n.elseIfBlocks.forEach((block) => visit(block));
      if (n.elseBlock) {
        visit(n.elseBlock, enclosingFunc);
      }
    } else if (node.type === "ConditionalBlock") {
      const n = node as ConditionalBlock;
      n.scope = scopeStack[scopeStack.length - 1];
      visit(n.condition, enclosingFunc);
      visit(n.block, enclosingFunc);
    } else if (
      node.type === "AssignmentExpression" ||
      node.type === "CompoundAssignmentExpression"
    ) {
      const n = node as AssignmentExpression | CompoundAssignmentExpression;
      n.scope = scopeStack[scopeStack.length - 1];
      visit(n.variable, enclosingFunc);
      visit(n.value, enclosingFunc);
    } else if (node.type === "DoWhileLoop" || node.type === "WhileLoop") {
      const n = node as DoWhileLoop | WhileLoop;
      n.scope = scopeStack[scopeStack.length - 1];
      visit(n.condition, enclosingFunc);
      visit(n.body, enclosingFunc);
    } else if (node.type === "ForLoop") {
      const n = node as ForLoop;
      // create a new scope for the initialization variables
      n.scope = createNewScope(scopeStack[scopeStack.length - 1]);
      scopeStack.push(n.scope);
      visit(n.initialization, enclosingFunc);
      visit(n.condition, enclosingFunc);
      visit(n.update, enclosingFunc);
      visit(n.body, enclosingFunc);
    }
  }

  visit(ast);
}
