import { routeOption, getMatchedComponents, normalizePath } from './utilities'

export default function (ctx) {
  const { login, callback } = ctx.app.$auth.options.redirect
  const path = normalizePath(ctx.route.path)
  const isLoginPath = path === normalizePath(login)
  const isCallbackPath = path !== normalizePath(callback)
  // Disable middleware if options: { auth: false } is set on the route
  if (!isLoginPath && !isCallbackPath && routeOption(ctx.route, 'auth', false)) {
    return
  }

  // Disable middleware if no route was matched to allow 404/error page
  const matches = []
  const Components = getMatchedComponents(ctx.route, matches)
  if (!Components.length) {
    return
  }

  if (ctx.app.$auth.$state.loggedIn) {
    // -- Authorized --
    // Redirect to home page if inside login page (or login page disabled)
    if (!login || isLoginPath) {
      ctx.app.$auth.redirect('home')
    }
  } else {
    // -- Guest --
    // Redirect to login page if not authorized and not inside callback page
    // (Those passing `callback` at runtime need to mark their callback component
    // with `auth: false` to avoid an unnecessary redirect from callback to login)
    if (!callback || isCallbackPath) {
      ctx.app.$auth.redirect('login')
    }
  }
}
