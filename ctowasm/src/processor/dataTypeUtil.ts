/**
 * Some utility functions used by the processor when working with data types.
 */

import {
  ArrayDataType,
  DataType,
  FunctionDataType,
  PointerDataType,
  PrimaryDataType,
  StructDataType,
  StructField,
  StructSelfPointer,
} from "~src/parser/c-ast/dataTypes";

import { ProcessingError, toJson } from "~src/errors";
import evaluateCompileTimeExpression from "~src/processor/evaluateCompileTimeExpression";
import { ScalarCDataType } from "~src/common/types";
import {
  getSizeOfScalarDataType,
  isFloatType,
  isIntegerType,
  primaryDataTypeSizes,
} from "~src/common/utils";
import { ENUM_DATA_TYPE, POINTER_SIZE } from "~src/common/constants";
import { FunctionDetails } from "~src/processor/c-ast/function";
import { ExpressionWrapperP } from "~src/processor/c-ast/expression/expressions";
import { getDataTypeOfExpression } from "~src/processor/util";

function getNumberOfElementsInArray(dataType: ArrayDataType): number {
  try {
    const numElementsConstant = evaluateCompileTimeExpression(
      dataType.numElements
    );
    if (numElementsConstant.type === "FloatConstant") {
      throw new ProcessingError("array size must be an integer-type");
    }
    return Number(numElementsConstant.value);
  } catch (e) {
    if (e instanceof ProcessingError) {
      throw new ProcessingError(
        "Array size must be compile-time constant expression (Variable Length Arrays not supported)"
      );
    } else {
      throw e;
    }
  }
}

/**
 * Returns the size in bytes of a data type.
 */
export function getDataTypeSize(
  dataType: DataType | StructSelfPointer
): number {
  if (
    dataType.type === "primary" ||
    dataType.type === "pointer" ||
    dataType.type === "struct self pointer"
  ) {
    return getSizeOfScalarDataType(
      dataType.type === "pointer" || dataType.type === "struct self pointer"
        ? "pointer"
        : dataType.primaryDataType
    );
  } else if (dataType.type === "array") {
    return (
      getNumberOfElementsInArray(dataType) *
      getDataTypeSize(dataType.elementDataType)
    );
  } else if (dataType.type === "struct") {
    return dataType.fields.reduce(
      (sum, field) =>
        sum +
        (field.dataType.type === "struct self pointer"
          ? POINTER_SIZE
          : getDataTypeSize(field.dataType)),
      0
    );
  } else if (dataType.type === "enum") {
    return primaryDataTypeSizes[ENUM_DATA_TYPE];
  } else if (dataType.type === "void") {
    throw new ProcessingError(`void value not ignored as it should be`);
  } else {
    throw new Error(
      `getDataTypeSize(): unhandled data type: ${toJson(dataType)}`
    );
  }
}
/**
 * Returns true if the type is scalar.
 * Only primary data types and pointers are scalar.
 */

export function isScalarDataType(dataType: DataType) {
  return (
    dataType.type === "primary" ||
    dataType.type === "pointer" ||
    dataType.type === "enum"
  ); // enums are signed ints, thus scalar
}

export function isRealDataType(dataType: DataType) {
  return isScalarDataType(dataType);
}

export function isIntegralDataType(dataType: DataType) {
  return (
    (dataType.type === "primary" && isIntegerType(dataType.primaryDataType)) ||
    dataType.type === "enum"
  );
}

export function isFloatDataType(dataType: DataType) {
  return dataType.type === "primary" && isFloatType(dataType.primaryDataType);
}

export function isArithmeticDataType(dataType: DataType) {
  return dataType.type === "primary" || dataType.type === "enum";
}

export function isVoidPointer(dataType: DataType) {
  return dataType.type === "pointer" && dataType.pointeeType.type === "void";
}

export function isPointerToCompleteDataType(dataType: DataType) {
  return dataType.type === "pointer" && dataType.pointeeType.type !== "void";
}

export function isPointer(dataType: DataType) {
  return dataType.type === "pointer";
}

export function getDecayedArrayPointerType(
  dataType: ArrayDataType
): PointerDataType {
  return {
    type: "pointer",
    pointeeType: dataType.elementDataType,
    isConst: dataType.isConst,
  };
}

export function getFunctionPointerOfFunction(
  fn: FunctionDataType
): PointerDataType {
  return {
    type: "pointer",
    pointeeType: fn,
  };
}

// export function checkPrimaryDataTypeCompatibility(dataTypeA: PrimaryCDataType, dataTypeB: PrimaryCDataType) {
//   return
// }

/**
 * Utlity function to generate data type string.
 */
// export function stringifyDataType(dataType: DataType) {
//   let str = "";
//   function helperFunction(dataType: DataType) {
//     if (dataType.type === "primary") {
//       str = `${dataType.primaryDataType} ${str}`;
//     } else if (dataType.type === "array") {
//       helperFunction(dataType.elementDataType);
//       str += " []";
//     } else if (dataType.type === "pointer") {
//       if (dataType.pointeeType === null) {
//         str = "void *";
//       } else if (dataType.pointeeType.type === "function" || dataType.pointeeType.type === "array") {
//         str = `(*${str})`;
//       } else {
//         str = `*${str}`;
//       }
//     } else if (dataType.type === "function") {
//       if (dataType.returnType === null) {
//         str = `void ${str}`;
//       } else {helperFunction(dataType.returnType)}
//       str += "(";
//       for (let i = 0; i < dataType.parameters.length - 1; ++i) {
//         str += stringifyDataType(dataType.parameters[i]);
//         str += ", ";
//       }
//       str += ")";
//     }
//   }
//   helperFunction(dataType);
//   return str;
// }

export function stringifyDataType(dataType: DataType): string {
  if (dataType.type === "primary") {
    return `${dataType.isConst ? "const " : ""}${dataType.primaryDataType}`;
  } else if (dataType.type === "array") {
    return `${dataType.isConst ? "const " : ""}array with size ${
      evaluateCompileTimeExpression(dataType.numElements).value
    } of ${stringifyDataType(dataType.elementDataType)}`;
  } else if (dataType.type === "pointer") {
    return `${dataType.isConst ? "const " : ""}pointer to ${stringifyDataType(
      dataType.pointeeType
    )}`;
  } else if (dataType.type === "function") {
    return `function (${dataType.parameters
      .map(stringifyDataType)
      .join(", ")}) returning ${stringifyDataType(dataType.returnType)}`;
  } else if (dataType.type === "struct") {
    return `struct ${dataType.tag ? dataType.tag : " "}`;
  } else if (dataType.type === "enum") {
    return `enum ${dataType.tag}`;
  } else if (dataType.type === "void") {
    return `void`;
  } else {
    console.assert(false, "stringifyDataType() unreachable else");
    return "";
  }
}

/**
 * Returns true if 2 struct fields are compatible (equivalent).
 */
function checkStructFieldCompatibility(
  a: StructField,
  b: StructField,
  ignoreQualifiers = false
) {
  if (a.tag !== b.tag) {
    return false;
  }
  if (a.dataType.type === "struct self pointer") {
    if (b.dataType.type !== "struct self pointer") {
      return false;
    }
    return true;
  } else {
    if (b.dataType.type === "struct self pointer") {
      return false;
    }
    return checkDataTypeCompatibility(a.dataType, b.dataType, ignoreQualifiers);
  }
}

/**
 * Checks the compatibility of two data types. Returns true if two data types are compatible as per the C17 standard.
 * @param ignoreQualifiers to check if the unqualified data types of a and b are compatible.
 */
export function checkDataTypeCompatibility(
  a: DataType,
  b: DataType,
  ignoreQualifiers = false
): boolean {
  if (
    a.type !== b.type ||
    (!ignoreQualifiers && a.isConst && !b.isConst) ||
    (b.isConst && !a.isConst)
  ) {
    return false;
  }
  if (a.type === "primary" && b.type === "primary") {
    return a.primaryDataType === b.primaryDataType;
  } else if (a.type === "array" && b.type === "array") {
    return (
      evaluateCompileTimeExpression(a.numElements).value === evaluateCompileTimeExpression(b.numElements).value &&
      checkDataTypeCompatibility(
        a.elementDataType,
        b.elementDataType,
        ignoreQualifiers
      )
    );
  } else if (a.type === "function" && b.type === "function") {
    // check return type compatibility
    if (a.returnType.type === "void") {
      if (b.returnType.type !== "void") {
        return false;
      }
    } else {
      if (
        b.returnType.type === "void" ||
        !checkDataTypeCompatibility(
          a.returnType,
          b.returnType,
          ignoreQualifiers
        )
      ) {
        return false;
      }
    }
    if (a.parameters.length !== b.parameters.length) {
      return false;
    }
    for (let i = 0; i < a.parameters.length; ++i) {
      if (
        !checkDataTypeCompatibility(
          a.parameters[i],
          b.parameters[i],
          ignoreQualifiers
        )
      ) {
        return false;
      }
    }
    return true;
  } else if (a.type === "struct" && b.type === "struct") {
    if (a.tag !== b.tag) {
      return false;
    }
    if (a.fields.length !== b.fields.length) {
      return false;
    }
    for (let i = 0; i < a.fields.length; ++i) {
      if (
        !checkStructFieldCompatibility(
          a.fields[i],
          b.fields[i],
          ignoreQualifiers
        )
      ) {
        return false;
      }
    }
    return true;
  } else if (a.type === "pointer" && b.type === "pointer") {
    if (isVoidPointer(a) && isVoidPointer(b)) {
      return true;
    }
    if (isVoidPointer(a) || isVoidPointer(b)) {
      return false;
    }
    return checkDataTypeCompatibility(
      a.pointeeType,
      b.pointeeType,
      ignoreQualifiers
    );
  } else if (a.type === "enum" && b.type === "enum") {
    // all enums in this implementation are equivalent to "signed int" and thus are compatibile with one another
    return true;
  } else if (a.type === "void" && b.type === "void") {
    return true;
  } else {
    console.assert(false, "checkDataTypeCompatibility(): Unhandled case");
    return false;
  }
}

/**
 * Represents a primary data type (scalar) that is part of a DataType. e.g. the field of a struct
 */
export interface PrimaryDataTypeMemoryObjectDetails {
  dataType: ScalarCDataType;
  offset: number; // offset in number of bytes from the first byte of the memory object that this primary data type object belongs in.
}
/**
 * Unpacks an data type into its constituent primary data types (including multi dim arrays and structs)
 */
export function unpackDataType(
  dataType: DataType
): PrimaryDataTypeMemoryObjectDetails[] {
  let currOffset = 0;
  const memoryObjects: PrimaryDataTypeMemoryObjectDetails[] = [];
  function recursiveHelper(dataType: DataType) {
    if (dataType.type === "primary") {
      memoryObjects.push({
        dataType: dataType.primaryDataType,
        offset: currOffset,
      });
      currOffset += getDataTypeSize(dataType);
    } else if (dataType.type === "pointer") {
      memoryObjects.push({
        dataType: "pointer",
        offset: currOffset,
      });
      currOffset += getDataTypeSize(dataType);
    } else if (dataType.type === "array") {
      const numElements = getNumberOfElementsInArray(dataType);
      for (let i = 0; i < numElements; ++i) {
        recursiveHelper(dataType.elementDataType);
      }
    } else if (dataType.type === "struct") {
      for (const field of dataType.fields) {
        if (field.dataType.type === "struct self pointer") {
          // pointer to the struct itself
          memoryObjects.push({
            dataType: "pointer",
            offset: currOffset,
          });
          currOffset += getDataTypeSize(dataType);
        } else {
          recursiveHelper(field.dataType);
        }
      }
    } else if (dataType.type === "enum") {
      memoryObjects.push({
        dataType: ENUM_DATA_TYPE,
        offset: currOffset,
      });
      currOffset += getDataTypeSize(dataType);
    } else {
      // should not happen
      throw new Error(
        `unpackDataType(): Invalid data type to unpack: ${toJson(dataType)}`
      );
    }
  }
  recursiveHelper(dataType);
  return memoryObjects;
}

/**
 * Returns the number of primary objects that compose a data type.
 */
function getDataTypeNumberOfPrimaryObjects(dataType: DataType): number {
  if (
    dataType.type === "primary" ||
    dataType.type === "pointer" ||
    dataType.type === "enum"
  ) {
    return 1;
  } else if (dataType.type === "array") {
    try {
      const numElementsConstant = evaluateCompileTimeExpression(
        dataType.numElements
      );
      if (numElementsConstant.type === "FloatConstant") {
        throw new ProcessingError("array size must be an integer-type");
      }
      return (
        getDataTypeNumberOfPrimaryObjects(dataType.elementDataType) *
        Number(numElementsConstant.value)
      );
    } catch (e) {
      if (e instanceof ProcessingError) {
        throw new ProcessingError(
          "array size must be compile-time constant expression (Variable Length Arrays not supported)"
        );
      } else {
        throw e;
      }
    }
  } else if (dataType.type === "struct") {
    return dataType.fields.reduce(
      (sum, field) =>
        sum +
        (field.dataType.type === "struct self pointer"
          ? 1
          : getDataTypeNumberOfPrimaryObjects(field.dataType)),
      0
    );
  } else {
    throw new Error(
      `getDataTypeNumberOfPrimaryObjects(): unhandled data type: ${toJson(
        dataType
      )}`
    );
  }
}

/**
 * Determines the index of the given field tag in a struct based in terms of the index in the unpacked primary data objects
 * that is returned by running unpackDataType on the whole struct,
 * as well as the datatype of the field.
 */
export function determineIndexAndDataTypeOfFieldInStruct(
  structDataType: StructDataType,
  fieldTag: string
): { fieldIndex: number; fieldDataType: DataType | StructSelfPointer } {
  let currIndex = 0;
  for (const field of structDataType.fields) {
    if (fieldTag === field.tag) {
      return { fieldIndex: currIndex, fieldDataType: field.dataType };
    }
    currIndex +=
      field.dataType.type === "struct self pointer"
        ? 1
        : getDataTypeNumberOfPrimaryObjects(field.dataType);
  }
  throw new ProcessingError(
    `struct${
      structDataType.tag !== null ? " " + structDataType.tag : ""
    } has no member named '${fieldTag}'`
  );
}

export function convertFunctionDataTypeToFunctionDetails(
  dataType: FunctionDataType
): FunctionDetails {
  const functionDetails: FunctionDetails = {
    sizeOfParams: 0,
    sizeOfReturn: 0,
    parameters: [],
    returnObjects: null,
  };

  if (dataType.returnType.type !== "void") {
    if (dataType.returnType.type === "array") {
      throw new ProcessingError(
        "array is not a valid return type from a function"
      );
    }

    functionDetails.sizeOfReturn += getDataTypeSize(dataType.returnType);
    functionDetails.returnObjects = unpackDataType(dataType.returnType).map(
      (scalarDataType) => ({
        dataType: scalarDataType.dataType,
        offset: scalarDataType.offset,
      })
    );
  }

  let offset = 0;
  for (const param of dataType.parameters) {
    // sanity check, as parser should have converted all array params into pointers.
    if (param.type === "array") {
      console.assert(
        param.type !== "array",
        "Compiler error: The type of a function parameter should not be an array after parsing"
      );
    }
    const dataTypeSize = getDataTypeSize(param);
    offset -= dataTypeSize;
    functionDetails.sizeOfParams += dataTypeSize;
    const unpackedParam = unpackDataType(param).map((scalarDataType) => ({
      dataType: scalarDataType.dataType,
      offset: offset + scalarDataType.offset, // offset of entire aggregate object + offset of particular sacalar data type within object
    }));
    // need to load unpacked param in reverse order, as in stack frame creation, the highest address subobject of an aggregate type gets loaded first as the stack frame grows from high to low address
    functionDetails.parameters.push(...unpackedParam.reverse());
  }

  return functionDetails;
}

export function isNullPointerConstant(expr: ExpressionWrapperP) {
  return (
    expr.exprs[0].type === "IntegerConstant" &&
    Number(expr.exprs[0].value) === 0
  );
}

/**
 * Checks if expr with a given datatype can be assigned to lvalue of another datatype.
 * Follows constraints on simple assignment as listed in 6.5.16.1 of C17 standard.
 */
export function checkAssignability(
  lvalue: DataType,
  expr: ExpressionWrapperP // the expression being assigned
) {
  if (lvalue.type === "array" || lvalue.type === "function" || lvalue.type === "void") {
    return false;
  }

  const exprDataType = getDataTypeOfExpression({
    expression: expr,
    convertArrayToPointer: true,
    convertFunctionToPointer: true,
  });

  // assigning null pointer constant
  if (lvalue.type === "pointer" && isNullPointerConstant(expr)) {
    return true;
  }

  return (
    (isArithmeticDataType(lvalue) && isArithmeticDataType(exprDataType)) ||
    (lvalue.type === "struct" &&
      checkDataTypeCompatibility(lvalue, exprDataType)) ||
    (lvalue.type === "pointer" &&
      exprDataType.type === "pointer" &&
      checkAssignabilityOfPointers(lvalue, exprDataType))
  );
}

export function checkAssignabilityOfPointers(
  left: PointerDataType,
  right: PointerDataType
) {
  if (isVoidPointer(left) || isVoidPointer(right)) {
    return true;
  }

  if (!left.pointeeType.isConst && right.pointeeType.isConst) {
    // right pointer has more pointee qualifiers than left
    return false;
  }

  return checkDataTypeCompatibility(
    left.pointeeType as DataType,
    right.pointeeType as DataType,
    true
  );
}

export function isFieldInStruct(dataType: StructDataType, fieldTag: string) {
  for (const field of dataType.fields) {
    if (field.tag === fieldTag) {
      return true;
    }
  }
  return false;
}

const integerPromotableTypes = new Set([
  "unsigned char",
  "signed char",
  "unsigned short",
  "signed short",
]);

/**
 * Returns the integer promoted version of the given datatype
 * @param dataType
 */
export function getIntegerPromotedDataType(dataType: DataType): DataType {
  if (
    isIntegralDataType(dataType) &&
    integerPromotableTypes.has((dataType as PrimaryDataType).primaryDataType)
  ) {
    return {
      type: "primary",
      primaryDataType: "signed int",
    };
  }
  return dataType;
}
