/**
 * C AST Processor Module.
 */

import { CAstRoot } from "~src/parser/c-ast/core";
import { CAstRootP } from "~src/processor/c-ast/core";
import processFunctionDefinition from "~src/processor/processFunctionDefinition";
import { processGlobalScopeDeclaration } from "~src/processor/processDeclaration";
import { SymbolTable } from "~src/processor/symbolTable";
import ModuleRepository, { ModuleName } from "~src/modules";
import { ProcessingError } from "~src/errors";

/**
 * Processes the C AST tree generated by parsing, to add additional needed information for certain nodes.
 * @param ast
 * @param sourceCode
 * @returns { astRootNode: root node of processed C AST, includedModules: list of all modules included in the C program}
 */
export default function process(
  ast: CAstRoot,
  moduleRepository: ModuleRepository,
): { astRootNode: CAstRootP; includedModules: ModuleName[] } {
  const includedModules: ModuleName[] = [];
  const symbolTable = new SymbolTable();
  const processedExternalFunctions = symbolTable.setExternalFunctions(
    ast.includedModules,
    moduleRepository,
  );
  const processedAst: CAstRootP = {
    type: "Root",
    functions: [],
    dataSegmentByteStr: "",
    dataSegmentSizeInBytes: 0,
    externalFunctions: [],
    functionTable: [],
  };

  // save the processed details of external functions
  for (const moduleName of ast.includedModules) {
    includedModules.push(moduleName);
    Object.keys(moduleRepository.modules[moduleName].moduleFunctions).forEach(
      (moduleFunctionName) => {
        processedAst.externalFunctions.push({
          moduleName,
          name: moduleFunctionName,
          parameters:
            processedExternalFunctions[moduleFunctionName].functionDetails
              .parameters,
          returnObjects:
            processedExternalFunctions[moduleFunctionName].functionDetails
              .returnObjects,
        });
      },
    );
  }

  ast.children.forEach((child) => {
    // special handling for function definitions
    if (child.type === "FunctionDefinition") {
      processedAst.functions.push(
        processFunctionDefinition(child, symbolTable),
      );
    } else {
      processGlobalScopeDeclaration(child, symbolTable);
    }
  });

  // check for presence of main function
  if (!symbolTable.hasSymbol("main")) {
    throw new ProcessingError("main function not defined");
  }

  processedAst.dataSegmentByteStr = symbolTable.dataSegmentByteStr.value;
  processedAst.dataSegmentSizeInBytes = symbolTable.dataSegmentOffset.value;
  processedAst.functionTable = symbolTable.functionTable;
  return { astRootNode: processedAst, includedModules };
}
