/**
 * Emoji 3D de Microsoft Fluent Emoji (licencia MIT, ver src/assets/emoji/LICENSE-fluent-emoji.txt).
 * Reducidos a 128 px en WebP e incluidos en la app para que funcionen sin internet.
 */
import bell from '../assets/emoji/bell.webp'
import calendar from '../assets/emoji/calendar.webp'
import crescentMoon from '../assets/emoji/crescent-moon.webp'
import fire from '../assets/emoji/fire.webp'
import flexedBiceps from '../assets/emoji/flexed-biceps.webp'
import floppyDisk from '../assets/emoji/floppy-disk.webp'
import gear from '../assets/emoji/gear.webp'
import glowingStar from '../assets/emoji/glowing-star.webp'
import hourglassNotDone from '../assets/emoji/hourglass-not-done.webp'
import lightBulb from '../assets/emoji/light-bulb.webp'
import partyPopper from '../assets/emoji/party-popper.webp'
import personInLotusPosition from '../assets/emoji/person-in-lotus-position.webp'
import pinkHeart from '../assets/emoji/pink-heart.webp'
import purpleHeart from '../assets/emoji/purple-heart.webp'
import redQuestionMark from '../assets/emoji/red-question-mark.webp'
import seedling from '../assets/emoji/seedling.webp'
import sparkles from '../assets/emoji/sparkles.webp'
import spiralNotepad from '../assets/emoji/spiral-notepad.webp'
import stopwatch from '../assets/emoji/stopwatch.webp'

export const EMOJI = {
  'bell': bell,
  'calendar': calendar,
  'crescent-moon': crescentMoon,
  'fire': fire,
  'flexed-biceps': flexedBiceps,
  'floppy-disk': floppyDisk,
  'gear': gear,
  'glowing-star': glowingStar,
  'hourglass-not-done': hourglassNotDone,
  'light-bulb': lightBulb,
  'party-popper': partyPopper,
  'person-in-lotus-position': personInLotusPosition,
  'pink-heart': pinkHeart,
  'purple-heart': purpleHeart,
  'red-question-mark': redQuestionMark,
  'seedling': seedling,
  'sparkles': sparkles,
  'spiral-notepad': spiralNotepad,
  'stopwatch': stopwatch,
} as const

export type EmojiName = keyof typeof EMOJI
