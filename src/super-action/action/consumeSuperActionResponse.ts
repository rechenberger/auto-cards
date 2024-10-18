import {
  SuperActionDialog,
  SuperActionError,
  SuperActionRedirect,
  SuperActionResponse,
  SuperActionToast,
} from './createSuperAction'

export const consumeSuperActionResponse = async <Result, Input>(options: {
  response: Promise<SuperActionResponse<Result, Input>>
  onToast?: (toast: SuperActionToast) => void
  onDialog?: (toast: SuperActionDialog) => void
  onRedirect?: (redirect: SuperActionRedirect) => void
  catch?: (error: SuperActionError) => void
}): Promise<Result | undefined> => {
  const r = await options.response
  if (r.toast && options.onToast) {
    options.onToast(r.toast)
  }
  if (r.dialog !== undefined && options.onDialog) {
    options.onDialog(r.dialog)
  }
  if (r.redirect && options.onRedirect) {
    options.onRedirect(r.redirect)
  }
  if (r.error) {
    if (options.catch) {
      options.catch(r.error)
      return
    } else {
      throw new Error(r.error.message)
    }
  }
  if (r.action) {
    const response = await r.action(undefined)
    if (response && 'superAction' in response) {
      await consumeSuperActionResponse({
        ...options,
        response: Promise.resolve(response.superAction),
      })
    }
  }
  if (r.next) {
    return await consumeSuperActionResponse({ ...options, response: r.next })
  }
  return r.result
}
