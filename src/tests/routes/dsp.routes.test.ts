import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import express from 'express';
import { DSPService } from 'services/dsp.service';
import dspRouter from 'routes/dsp.routes';

// ─── App setup ───────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use(dspRouter);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockContract = {
    _id: '6647a1e2c2a4e3b1d8f00001',
    consumerPid: 'pid-consumer-001',
    agreementId: 'agr-001',
    status: 'ACCEPTED',
    createdAt: new Date().toISOString(),
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('DSP Routes', () => {
    let sandbox: sinon.SinonSandbox;
    let serviceStub: sinon.SinonStubbedInstance<DSPService>;

    beforeEach(async () => {
        sandbox = sinon.createSandbox();
        serviceStub = sandbox.createStubInstance(DSPService);
        sandbox.stub(DSPService, 'getInstance').resolves(serviceStub as any);
    });

    afterEach(() => {
        sandbox.restore();
    });

    // ── GET /dsp/all ──────────────────────────────────────────────────────────

    describe('GET /dsp/all', () => {
        it('should return 200 with list of contracts', async () => {
            serviceStub.getContracts.resolves([mockContract] as any);

            const res = await request(app).get('/dsp/all/');

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('contracts');
            expect(res.body.contracts).to.be.an('array');
            expect(res.body.contracts[0]).to.have.property('_id');
        });

        it('should return 500 when service throws', async () => {
            serviceStub.getContracts.rejects(new Error('DB error'));

            const res = await request(app).get('/dsp/all/');

            expect(res.status).to.equal(500);
        });
    });

    // ── GET /dsp/:id ──────────────────────────────────────────────────────────

    describe('GET /dsp/:id', () => {
        it('should return 200 with a contract by id', async () => {
            serviceStub.getContract.resolves(mockContract as any);

            const res = await request(app).get(`/dsp/${mockContract._id}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('_id', mockContract._id);
        });

        it('should return 404 when contract not found', async () => {
            serviceStub.getContract.resolves(null);

            const res = await request(app).get('/dsp/nonexistent-id');

            expect(res.status).to.equal(404);
        });

        it('should return 500 when service throws', async () => {
            serviceStub.getContract.rejects(new Error('DB error'));

            const res = await request(app).get('/dsp/error-id');

            expect(res.status).to.equal(500);
        });
    });

    // ── GET /dsp/agreement/:id ────────────────────────────────────────────────

    describe('GET /dsp/agreement/:id', () => {
        it('should return 200 with a contract by agreementId', async () => {
            serviceStub.getContractByAgreementId.resolves(mockContract as any);

            const res = await request(app).get(
                `/dsp/agreement/${mockContract.agreementId}`
            );

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('agreementId', mockContract.agreementId);
        });

        it('should return 404 when agreement not found', async () => {
            serviceStub.getContractByAgreementId.resolves(null);

            const res = await request(app).get('/dsp/agreement/unknown-agr');

            expect(res.status).to.equal(404);
        });

        it('should return 500 when service throws', async () => {
            serviceStub.getContractByAgreementId.rejects(new Error('DB error'));

            const res = await request(app).get('/dsp/agreement/error-agr');

            expect(res.status).to.equal(500);
        });
    });

    // ── GET /dsp/all/:id ──────────────────────────────────────────────────────

    describe('GET /dsp/all/:id', () => {
        it('should return 200 with contracts for a participant', async () => {
            serviceStub.getAllDspContractForParticipant.resolves([mockContract] as any);

            const res = await request(app).get('/dsp/all/participant-id-001');

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('contracts');
            expect(res.body.contracts).to.be.an('array').with.lengthOf(1);
        });

        it('should return empty array when participant has no contracts', async () => {
            serviceStub.getAllDspContractForParticipant.resolves([]);

            const res = await request(app).get('/dsp/all/unknown-participant');

            expect(res.status).to.equal(200);
            expect(res.body.contracts).to.be.an('array').that.is.empty;
        });

        it('should return 500 when service throws', async () => {
            serviceStub.getAllDspContractForParticipant.rejects(new Error('DB error'));

            const res = await request(app).get('/dsp/all/error-participant');

            expect(res.status).to.equal(500);
        });
    });

    // ── GET /dsp/checkpid/:consumerPid ────────────────────────────────────────

    describe('GET /dsp/checkpid/:consumerPid', () => {
        it('should return 200 with exists=true when consumerPid exists', async () => {
            serviceStub.checkConsumerPidExists.resolves(true);

            const res = await request(app).get(
                `/dsp/checkpid/${mockContract.consumerPid}`
            );

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('exists', true);
        });

        it('should return 200 with exists=false when consumerPid does not exist', async () => {
            serviceStub.checkConsumerPidExists.resolves(false);

            const res = await request(app).get('/dsp/checkpid/unknown-pid');

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('exists', false);
        });

        it('should return 500 when service throws', async () => {
            serviceStub.checkConsumerPidExists.rejects(new Error('DB error'));

            const res = await request(app).get('/dsp/checkpid/error-pid');

            expect(res.status).to.equal(500);
        });
    });

    // ── POST /dsp ─────────────────────────────────────────────────────────────

    describe('POST /dsp/', () => {
        it('should return 201 when contract is created', async () => {
            serviceStub.genContract.resolves(mockContract as any);

            const res = await request(app)
                .post('/dsp/')
                .send({ contract: { consumerPid: 'pid-new-001', status: 'REQUESTED' } });

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('_id');
        });

        it('should return 500 when contract body is missing', async () => {
            const res = await request(app).post('/dsp/').send({});

            expect(res.status).to.equal(500);
        });

        it('should return 500 when service throws', async () => {
            serviceStub.genContract.rejects(new Error('DB error'));

            const res = await request(app)
                .post('/dsp/')
                .send({ contract: { consumerPid: 'pid-fail' } });

            expect(res.status).to.equal(500);
        });
    });

    // ── PUT /dsp/:id ──────────────────────────────────────────────────────────

    describe('PUT /dsp/:id', () => {
        it('should return 200 when contract is updated', async () => {
            const updated = { ...mockContract, status: 'FINALIZED' };
            serviceStub.updateContract.resolves(updated as any);

            const res = await request(app)
                .put(`/dsp/${mockContract._id}`)
                .send({ status: 'FINALIZED' });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'FINALIZED');
        });

        it('should return 404 when contract to update is not found', async () => {
            serviceStub.updateContract.resolves(null);

            const res = await request(app)
                .put('/dsp/nonexistent-id')
                .send({ status: 'FINALIZED' });

            expect(res.status).to.equal(404);
        });

        it('should return 500 when service throws', async () => {
            serviceStub.updateContract.rejects(new Error('DB error'));

            const res = await request(app)
                .put('/dsp/error-id')
                .send({ status: 'FINALIZED' });

            expect(res.status).to.equal(500);
        });
    });

    // ── DELETE /dsp/:id ───────────────────────────────────────────────────────

    describe('DELETE /dsp/:id', () => {
        it('should return 200 when contract is deleted', async () => {
            serviceStub.deleteContract.resolves();

            const res = await request(app).delete(`/dsp/${mockContract._id}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message', 'DSP Contract deleted successfully.');
        });

        it('should return 500 when service throws', async () => {
            serviceStub.deleteContract.rejects(new Error('DB error'));

            const res = await request(app).delete('/dsp/error-id');

            expect(res.status).to.equal(500);
        });
    });
});

