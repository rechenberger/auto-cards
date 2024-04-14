import {
  SuperActionDialog,
  SuperActionError,
  SuperActionResponse,
  SuperActionToast,
} from './createSuperAction'

export const consumeSuperActionResponse = async <T>(options: {
  response: Promise<SuperActionResponse<T>>
  onToast?: (toast: SuperActionToast) => void
  onDialog?: (toast: SuperActionDialog) => void
  catch?: (error: SuperActionError) => void
}): Promise<T | undefined> => {
  const r = await options.response
  // console.log('consumeSuperActionResponse', r)
  if (r.toast && options.onToast) {
    options.onToast(r.toast)
  }
  if (r.dialog && options.onDialog) {
    options.onDialog(r.dialog)
  }
  if (r.error) {
    if (options.catch) {
      options.catch(r.error)
      return
    } else {
      throw new Error(r.error.message)
    }
  }
  if (r.next) {
    return await consumeSuperActionResponse({ ...options, response: r.next })
  }
  return r.result
}
