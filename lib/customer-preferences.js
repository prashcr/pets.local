// Allowing Customer's preferences to be specified with a raw WHERE clause
// would provide the most expresssivity but open us to SQL injections
// Therefore, preferences are specified as a comma-delimited string
// consisting of AND'ed WHERE clauses limited to (=, <>, >, <) and without spaces
// e.g. "age>3,species='dog',breed<>'poodle'" translates to
// select * from pet where age > 3 and species = 'dog' and breed <> 'poodle'

const re = /^([a-z_]+)((<>)|[=<>])(('[a-z]+')|([0-9]+))$/

module.exports = prefs => {
  const prefsArray = prefs.split(',')
  console.log(prefsArray)
  if (!prefsArray.every(pref => re.test(pref))) {
    throw new Error('Preference did not match format')
  }
  return prefsArray
    .map(pref => 'pet.' + pref) // in case a property is in both customer and pet
    .join(' and ')
}
