import DS from 'ember-data';

export default DS.Model.extend({
  token: DS.attr(),
  name: DS.attr(),
  password: DS.attr(),
  user: DS.belongsTo('user')
});
