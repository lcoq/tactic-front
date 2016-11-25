import DS from 'ember-data';

export default DS.Model.extend({
  token: DS.attr(),
  name: DS.attr(),
  user: DS.belongsTo()
});
