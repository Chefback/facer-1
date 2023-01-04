const Sequelize = require('sequelize');
const config = require('./config');

var sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        dialect: 'mysql',
        timezone: '+08:00',
        // Model initiation default options
        define: {
            // create_time && update_time
            timestamps: true,
            // delete_time
            paranoid: true,
            deletedAt: 'deleted_at',
            // 把驼峰命名转换为下划线
            underscored: true,
            scopes: {
                bh: {
                    attributes: {
                        exclude: ['password', 'updated_at', 'deleted_at', 'created_at']
                    }
                },
                iv: {
                    attributes: {
                        exclude: ['content', 'password', 'updated_at', 'deleted_at']
                    }
                },
                //search records in recent 7 days
                in7: {
                    where: {
                        exclude: ['content', 'password', 'updated_at', 'deleted_at']
                    }
                }
            }
        }
        ,
        pool: {
            max: 5,
            min: 0,
            idle: 30000
        }
    });

let User = sequelize.define('user', {
    userid: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        defaultValue: BaseModel.uid()
    },
    name: {
        type: Sequelize.STRING(20),
        allowNull: true
    },
    sex: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    phone: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
    description: {
        type: Sequelize.STRING(20),
        allowNull: true
    },
}, {
    indexes: [
        {
            name: 'index_user_1',
            fields: ['mail'],
            unique: true
        },
        {
            name: 'index_user_2',
            fields: ['mail', 'passwd']
        }
    ],
    getterMethods: {
        to_dict: function () {
            return {
                id: this.id.toString(),
                name: this.name
            }
        }
    }
});

let Admin = sequelize.define('admin', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        defaultValue: BaseModel.uid()
    },
    createdAt: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    name: {
        type: Sequelize.STRING(20),
        allowNull: true
    }
}, {
    indexes: [
        {
            name: 'index_user_1',
            fields: ['mail'],
            unique: true
        },
        {
            name: 'index_user_2',
            fields: ['mail', 'passwd']
        }
    ],
    getterMethods: {
        to_dict: function () {
            return {
                id: this.id.toString(),
                name: this.name
            }
        }
    }
});

let Recognition = sequelize.define('recognition', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        defaultValue: BaseModel.uid()
    },
    recognition: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
}, {
    indexes: [
        {
            name: 'index_user_1',
            fields: ['mail'],
            unique: true
        },
        {
            name: 'index_user_2',
            fields: ['mail', 'passwd']
        }
    ],
    getterMethods: {
        to_dict: function () {
            return {
                id: this.id.toString(),
                name: this.name
            }
        }
    }
});
module.exports = { User, Admin, Recognition };