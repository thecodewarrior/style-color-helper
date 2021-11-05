import {library} from '@fortawesome/fontawesome-svg-core'
import {
  faArrowLeft,
  faEye, faEyeSlash,
  faGripLines, faICursor, faMinus, faMinusCircle, faPlus, faSlidersH, faTimes,
} from '@fortawesome/free-solid-svg-icons'

export function initIcons() {
  library.add(
      faGripLines,
      faEye,
      faEyeSlash,
      faMinusCircle,
      faPlus,
      faMinus,
      faTimes,
      faArrowLeft,
      faSlidersH,
      faICursor,
  )
}
