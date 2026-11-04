// Exercise registry: one module per type, each exporting build(spec, ctx).

import * as choice from './choice.js';
import * as meaning from './meaning.js';
import * as listen from './listen.js';
import * as wordbank from './wordbank.js';
import * as typeword from './typeword.js';
import * as match from './match.js';
import * as ending from './ending.js';
import * as caseEx from './case.js';
import * as table from './table.js';
import * as pair from './pair.js';
import * as speak from './speak.js';
import * as bridge from './bridge.js';

export const EXERCISES = { choice, meaning, listen, wordbank, dictation: wordbank, typeword, match, ending, case: caseEx, table, pair, speak, bridge };

export function buildExercise(spec, ctx) {
  const mod = EXERCISES[spec.type];
  if (!mod) throw new Error(`Unknown exercise type ${spec.type}`);
  return mod.build(spec, ctx);
}
