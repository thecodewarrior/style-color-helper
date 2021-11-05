import {library} from '@fortawesome/fontawesome-svg-core'
import {
  faArrowLeft,
  faEye,
  faEyeSlash,
  faFolder, faFolderOpen,
  faGripLines,
  faICursor,
  faMinus,
  faMinusCircle,
  faPlus,
  faSave,
  faSlidersH,
  faTimes, faTrashAlt,
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
      faFolder,
      faFolderOpen,
      faSave,
      faTrashAlt,
  )
}
