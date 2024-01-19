/**
 * Definitions of various utility functions.
 */

import { SymbolEntry, SymbolTable } from "~src/processor/symbolTable";
import { ProcessingError } from "~src/errors";
import { Position } from "~src/parser/c-ast/misc";
import { ExpressionP, StatementP } from "~src/processor/c-ast/core";
import { FunctionDefinitionP } from "~src/processor/c-ast/function";
import { Expression } from "~src/parser/c-ast/core";
import processExpression from "~src/processor/processExpression";
import { IntegerConstantP } from "~src/processor/c-ast/expression/constants";
import { FunctionCall } from "~src/parser/c-ast/expression/unaryExpression";
import { isScalarDataType } from "~src/processor/dataTypeUtil";
import { DataType } from "~src/parser/c-ast/dataTypes";
import { ExpressionWrapperP } from "~src/processor/c-ast/expression/expressions";

export function processCondition(
  condition: Expression,
  symbolTable: SymbolTable
) {
  const processedCondition = processExpression(condition, symbolTable);
  const dataTypeOfConditionExpression = getDataTypeOfExpression({
    expression: processedCondition,
    convertArrayToPointer: true,
  });
  if (!isScalarDataType(dataTypeOfConditionExpression)) {
    throw new ProcessingError(
      `Cannot use ${dataTypeOfConditionExpression.type} where scalar is required`
    );
  }
  return processedCondition.exprs[0];
}

export function createMemoryOffsetIntegerConstant(
  offset: number
): IntegerConstantP {
  return {
    type: "IntegerConstant",
    dataType: "signed int", // unsigned int should be appropriate type to give to IntegerConstant offsets since pointer size is 4 TODO: check this
    value: BigInt(offset),
  };
}

/**
 * Retrieves the DataType of the processed expression. This should be same as the originalDataType field of ExpressionWrapperP, except in the case
 * when @param convertArrayToPointer is set to true, in which case any originalDataType that is array should be converted to pointer.
 */
export function getDataTypeOfExpression({
  expression,
  convertArrayToPointer,
}: {
  expression: ExpressionWrapperP;
  convertArrayToPointer?: boolean;
}): DataType {
  if (convertArrayToPointer && expression.originalDataType.type === "array") {
    return {
      type: "pointer",
      pointeeType: expression.originalDataType.elementDataType,
    };
  }
  return expression.originalDataType;
}
