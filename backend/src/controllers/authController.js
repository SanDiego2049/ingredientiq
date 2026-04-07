const { supabase } = require('../services/supabaseService')
const { success, fail } = require('../utils/responseHelpers')

async function getMe(req, res) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single()

  if (error) {
    return fail(res, 'Profile not found', 404)
  }

  return success(res, data)
}

module.exports = { getMe }
