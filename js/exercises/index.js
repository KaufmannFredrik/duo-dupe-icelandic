// Exercise registry: one module per type, each exporting build(spec, ctx).

import * as choice from './choice.js';
import * as meaning from './meaning.js';
import * as listen from './listen.js';
import * as wordbank from './wordbank.js';
import * as typeword from './typeword.js';
import * as typeform from './typeform.js';
import * as match from './match.js';
import * as ending from './ending.js';
import * as caseEx from './case.js';
import * as table from './table.js';
import * as pair from './pair.js';
import * as speak from './speak.js';
import * as bridge from './bridge.js';
import * as letter from './letter.js';
import * as lettername from './lettername.js';
import * as likenb from './likenb.js';
import * as spell from './spell.js';
import * as numlisten from './numlisten.js';
import * as numtype from './numtype.js';
import * as numbuild from './numbuild.js';
import * as write from './write.js';
import * as parts from './parts.js';

// conjugate: the form of a verb (person and number), on the same screen as a case ending.
// typeform: the same form, typed.
// letter, lettername, likenb, spell: letters and sounds (js/engine/letters.js).
// numlisten, numtype, numbuild: numbers by ear and in words (js/engine/numbers.js).
// write: guided writing, a model text with gaps about the learner (js/engine/writing.js).
// parts: a strong verb's principal parts (section A2).
export const EXERCISES = { choice, meaning, listen, wordbank, dictation: wordbank, typeword, typeform, match, ending, conjugate: ending, case: caseEx, table, pair, speak, bridge, letter, lettername, likenb, spell, numlisten, numtype, numbuild, write, parts };

export function buildExercise(spec, ctx) {
  const mod = EXERCISES[spec.type];
  if (!mod) throw new Error(`Unknown exercise type ${spec.type}`);
  return mod.build(spec, ctx);
}
