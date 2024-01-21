/**
 * Definition of the core nodes for processed C AST. Most of the nodes are the same as those from the unprocessed
 * AST generated by the parser.
 *
 * Processed node names follow the same naming as their original C AST counterpart, with "P" suffix to indicate that they are the processed version.
 */

import { ScalarCDataType } from "~src/common/types";
import { ConstantP } from "~src/processor/c-ast/expression/constants";
import {
  BinaryExpressionP,
  PostStatementExpressionP,
  PreStatementExpressionP,
  UnaryExpressionP,
} from "~src/processor/c-ast/expression/expressions";
import {
  FunctionCallP,
  FunctionDefinitionP,
} from "~src/processor/c-ast/function";
import { IterationStatementP } from "~src/processor/c-ast/statement/iterationStatement";
import {
  Address,
  MemoryLoad,
  MemoryStore,
} from "~src/processor/c-ast/memory";
import { SelectionStatementP } from "~src/processor/c-ast/statement/selectionStatement";
import { JumpStatementP } from "~src/processor/c-ast/statement/jumpStatement";
import { PrimaryDataTypeMemoryObjectDetails } from "~src/processor/dataTypeUtil";

export type CNodeP = FunctionDefinitionP | StatementP | ExpressionP;

/**
 * Every processed C AST node should extend this interface.
 */
export interface CNodePBase {
  type: string;
}

export type StatementP =
  | MemoryStore
  | SelectionStatementP
  | IterationStatementP
  | FunctionCallP
  | JumpStatementP
  | MemoryStore

// An expression results in the "loading" of a primary data type from memory (could be to a virtual stack as in Wasm, or register in other architectures)
export type ExpressionP =
  | BinaryExpressionP
  | ConstantP
  | PreStatementExpressionP
  | PostStatementExpressionP
  | UnaryExpressionP
  | Address
  | MemoryLoad

/**
 * All expressions should inherit this, as all expressions should have a primary data type.
 */
export interface ExpressionPBase extends CNodePBase {
  dataType: ScalarCDataType;
}

export interface ExternalFunction {
  name: string;
  parameters: PrimaryDataTypeMemoryObjectDetails[];
  returnObjects: PrimaryDataTypeMemoryObjectDetails[] | null;
}

export interface CAstRootP extends CNodePBase {
  type: "Root";
  functions: FunctionDefinitionP[];
  dataSegmentByteStr: string; // the string of bytes (each byte is in the form "\\XX" where X is a digit in base-16) to initialize the data segment with, determined by processing initializers for data segment variables.
  dataSegmentSizeInBytes: number;
  externalFunctions: Record<string, ExternalFunction>;
}
