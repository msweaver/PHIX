/*=======================================================================
Copyright 2013 Amida Technology Solutions (http://amida-tech.com)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
======================================================================*/

var should = require('should');
var supertest = require('supertest');
var Profile = require('../../models/personal');
var Account = require('../../models/account');
var Message = require('../../models/message');
var Delegation = require('../../models/delegation');
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var outboxMessages = require('../records/outboxMessages.json');

var config = require('../../config.js');
if (config.server.ssl.enabled) {
  var deploymentLocation = 'https://' + config.server.url + ':' + config.server.port;
} else {
  var deploymentLocation = 'http://' + config.server.url + ':' + config.server.port;
}
var databaseLocation = 'mongodb://' + config.database.url + '/' + config.database.name;
var api = supertest.agent(deploymentLocation);
var common = require('../common/commonFunctions');

if (mongoose.connection.readyState === 0) {
  mongoose.connect(databaseLocation);
}

var testInboxMessage;
var testOutboxMessage;

/*Code block loads user for testing.*/
/*===========================================================*/

var testName = 'mailboxUser';
var testPass = 'mailboxPass';
var testEmail = 'test@demo.org';
var directEmail = '';
var testProfile = {
  firstname: 'Jane',
  middlename: 'Q',
  lastname: 'Public',
  birthdate: '06/19/1976',
  ssn: '123-45-6789',
  gender: 'male',
  address: '123 Fake Street',
  address2: 'Apt 6',
  city: 'Arlington',
  state: 'VA',
  zipcode: '12345',
  phone: '1-234-999-1234',
  phonetype: 'mobile'
};

describe('Pre Authentication Tests', function() {

  it('Get Messages Unauthenticated', function(done) {
    api.get('/messages/meta')
      .expect(401)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('Get Message Unauthenticated', function(done) {
    api.get('/messages/message/123')
      .expect(401)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('Get Inbox Unauthenticated', function(done) {
    api.get('/messages/inbox')
      .expect(401)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('Get Outbox Unauthenticated', function(done) {
    api.get('/messages/outbox')
      .expect(401)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('Get Archive Unauthenticated', function(done) {
    api.get('/messages/archive')
      .expect(401)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('Get All Unauthenticated', function(done) {
    api.get('/messages/all')
      .expect(401)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

});



describe('Create User', function() {

  it('Create Account', function(done) {
    common.createAccount(api, testName, testPass, testEmail, function(err) {
      if (err) {
        return done(err);
      }
      common.loginAccount(api, testName, testPass, function(err) {
        if (err) {
          return done(err);
        }
        done();
      });
    });
  });

  it('Generate Profile', function(done) {
    common.createProfile(api, testProfile, function(err) {
      if (err) {
        done(err);
      }
      done();
    });
  });

});

describe('Pre-Verification Testing', function() {

  it('Get Messages Unverified', function(done) {
    api.get('/messages/meta')
      .expect(403)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('Get Message Unverified', function(done) {
    api.get('/messages/message/123')
      .expect(403)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('Get Inbox Unverified', function(done) {
    api.get('/messages/inbox')
      .expect(403)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('Get Outbox Unverified', function(done) {
    api.get('/messages/outbox')
      .expect(403)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('Get Archived Unverified', function(done) {
    api.get('/messages/archive')
      .expect(403)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('Get All Unverified', function(done) {
    api.get('/messages/all')
      .expect(403)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

});


describe('Verification', function() {

  it('Verify Account', function(done) {
    api.get('/account')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        }
        common.verifyAccount(api, res.body.token, function(err) {
          if (err) {
            done(err);
          }
          api.get('/account')
            .expect(200)
            .end(function(err, res) {
              if (err) {
                done(err);
              }
              directEmail = res.body.directemail;
              done();
            });
        });
      });
  });
});


describe('Verified: 0 Messages', function() {

  it('Test Meta API', function(done) {
    api.get('/messages/meta')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          res.body.inbox.should.equal(0);
          res.body.outbox.should.equal(0);
          res.body.inboxUnread.should.equal(0);
          res.body.archived.should.equal(0);
          done();
        }
      });
  });

});

describe('Create Test Messages', function() {

  it('Generate Test Inbox Message', function(done) {

    Account.findOne({
      username: testName
    }, function(err, res) {
      if (err) {
        done(err);
      }

      var testInboxMessage = {
        owner: res._id,
        inbox: true,
        sender: 'doctor@node.amida-demo.com',
        stored: Date.now(),
        subject: 'Your recent visit.',
        contents: 'Your medical records are attached',
        read: false,
        attachments: []
      };

      var sampleMessage = new Message(testInboxMessage);
      sampleMessage.save(function(err, res) {
        if (err) {
          done(err);
        }
        testInboxMessage.message_id = res._id;
        done();
      });
    });
  });

});

describe('Create Messages', function() {

  it('Load Sample Outbox Messages', function(done) {

    function postMessages(iteration, outboxMessage) {
      api.post('/messages')
        .send(outboxMessage)
        .expect(201)
        .end(function(err, res) {
          if (err) {done(err);}
          if (iteration === (outboxMessages.messages.length - 1)) {
            done();
          }
        });
    }

    for (var i = 0; i < outboxMessages.messages.length; i++) {

      postMessages(i, outboxMessages.messages[i]);
    }
  });

});


describe('Verified: Messages', function() {

  it('GET Meta API', function(done) {
    api.get('/messages/meta')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          res.body.inbox.should.equal(1);
          res.body.outbox.should.equal(100);
          res.body.inboxUnread.should.equal(1);
          res.body.archived.should.equal(0);
          done();
        }
      });
  });

  it('GET Inbox API', function(done) {
    api.get('/messages/inbox')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          //console.log(res.body);
          done();
        }
      });
  });

  it('GET Outbox API', function(done) {
    api.get('/messages/outbox')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          //console.log(res.body);
          done();
        }
      });
  });

  it('GET Archive API', function(done) {
    api.get('/messages/archive')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          //console.log(res.body);
          done();
        }
      });
  });

  it('GET All API', function(done) {
    api.get('/messages/all')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          //console.log(res.body);
          done();
        }
      });
  });

  it('GET Bad API', function(done) {
    api.get('/messages/fail')
      .expect(404)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });

  });

  it('GET Outbox - Limit Pagination test', function(done) {
    api.get('/messages/outbox?limit=20')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          res.body.messages.length.should.equal(20);
          done();
        }
      });
  });

  it('GET Outbox - Max Limit Pagination test', function(done) {
    api.get('/messages/outbox?limit=2000')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          res.body.messages.length.should.equal(50);
          done();
        }
      });
  });

  it('GET Outbox - Negative Limit Pagination test', function(done) {
    api.get('/messages/outbox?limit=-200')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          res.body.messages.length.should.equal(50);
          done();
        }
      });
  });

  it('GET Outbox - Alpha Limit Pagination test', function(done) {
    api.get('/messages/outbox?limit=yousuck!!!')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          res.body.messages.length.should.equal(50);
          done();
        }
      });
  });

  it('GET Outbox - Start Pagination test', function(done) {
    api.get('/messages/outbox?start=70')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          res.body.messages.length.should.equal(30);
          done();
        }
      });
  });

  it('GET Outbox - Negative Start Pagination test', function(done) {
    api.get('/messages/outbox?start=-200')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          res.body.messages.length.should.equal(50);
          done();
        }
      });
  });

  it('GET Outbox - Too long Start Pagination test', function(done) {
    api.get('/messages/outbox?start=2000')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          res.body.messages.length.should.equal(0);
          done();
        }
      });
  });

  it('GET Outbox - Alpha Start Pagination test', function(done) {
    api.get('/messages/outbox?start=yousuck!!!')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          res.body.messages.length.should.equal(50);
          done();
        }
      });
  });

  it('GET Outbox - Combined Pagination test 1', function(done) {
    api.get('/messages/outbox?start=70&limit=40')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          res.body.messages.length.should.equal(30);
          done();
        }
      });
  });

  it('GET Outbox - Combined Pagination test 1', function(done) {
    api.get('/messages/outbox?start=yousuck!!&limit=400')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          res.body.messages.length.should.equal(50);
          done();
        }
      });
  });

  it('GET Outbox - Combined Pagination test 1', function(done) {
    api.get('/messages/outbox?start=10&limit=5')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          res.body.messages.length.should.equal(5);
          done();
        }
      });
  });

  it('GET Valid Outbox Message', function(done) {
    api.get('/messages/outbox')
      .expect(200)
      .end(function(err, res) {
        function getMessage(iteration, message) {
          api.get('/messages/message/' + message._id)
            .expect(200)
            .end(function(err, res) {
              if (err) {
                done(err);
              } else {
                if ((iteration + 1) === (messageLength)) {
                  done();
                }
              }

            });
        }
        if (err) {
          done(err);
        } else {
          var messageLength = res.body.messages.length;
          for (var i = 0; i < messageLength; i++) {
            getMessage(i, res.body.messages[i]);
          }
        }
      });
  });

  it('POST Messages API ', function(done) {
    api.post('/messages')
      .send({
        'recipient': 'test@amida-tech.com',
        'contents': 'Test Message',
        'subject': 'Hey There!'
      })
      .expect(201)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('POST Messages API - Too long Subject', function(done) {
    api.post('/messages')
      .send({
        'subject': 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
      })
      .expect(400)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('POST Messages API - Missing Recipient', function(done) {
    api.post('/messages')
      .send({
        'body': 'fail'
      })
      .expect(400)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('POST Messages API - Empty Recipient', function(done) {
    api.post('/messages')
      .send({
        'recipient': ''
      })
      .expect(400)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('POST Messages API - Bad Recipient', function(done) {
    api.post('/messages')
      .send({
        'recipient': 'IM NOT AN EMAIL'
      })
      .expect(400)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('POST Messages API - Too Long Recipient', function(done) {
    api.post('/messages')
      .send({
        'recipient': 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX@fake.com'
      })
      .expect(400)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

  it('POST Messages API - Too Long Message', function(done) {
    api.post('/messages')
      .send({
        'recipient': 'test@fake.com',
        'subject': 'test message',
        'contents': 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
      })
      .expect(400)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });

});

describe('Cleanup Test Account', function() {

  it('Logout Account', function(done) {
    common.logoutAccount(api, function(err) {
      if (err) {
        done(err);
      }
      done();
    });
  });

  it('Remove Account', function(done) {
    common.removeAccount(testName, function(err) {
      if (err) {
        done(err);
      }
      done();
    });
  });

  it('Remove Profile', function(done) {
    common.removeProfile(testName, function(err) {
      if (err) {
        done(err);
      }
      done();
    });
  });

  it('Remove Messages', function(done) {
    common.removeMessages(directEmail, function(err) {
      if (err) {
        done(err);
      }
      done();
    });
  });

});