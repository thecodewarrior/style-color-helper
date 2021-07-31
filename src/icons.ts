import {library} from '@fortawesome/fontawesome-svg-core'
import {
  faEye, faEyeSlash,
  faGripLines, faMinus, faMinusCircle, faPlus,
} from '@fortawesome/free-solid-svg-icons'

export function initIcons() {
  library.add(
      faGripLines,
      faEye,
      faEyeSlash,
      faMinusCircle,
      faPlus,
      faMinus
  )
}
