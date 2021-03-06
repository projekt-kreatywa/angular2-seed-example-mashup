import {Component} from 'angular2/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';
import {QuizServices} from '../../services/QuizServices';
import {Authentication} from '../../services/Authentication';
import * as RouterMod from 'angular2/router';
import {IQuiz, ITest, IUserQuestion, IScoringResult} from '../../../common/interfaces/QuizInterfaces';
import {Quiz} from '../../models/Quiz';
import {Test} from '../../models/Test';

enum ProctorState {
    Initializing = 0,
    GetName = 1,
    PresentQuestion = 2
}

@Component({
    selector: 'proctor-exam',
    templateUrl: './quiz/components/ProctorExam.html',
    styleUrls: ['./quiz/components/ProctorExam.css'],

    providers: [QuizServices],
    directives: [FORM_DIRECTIVES, CORE_DIRECTIVES]
})
export class ProctorExam {

    proctorState:ProctorState = ProctorState.Initializing;
    name: string = '';

    quizId = 0;
    testId = 0;

    quiz:IQuiz = new Quiz();
    test:ITest = new Test();

    userAnswers: {};

    _currentQuestion:IUserQuestion = null;

    get currentQuestion():IUserQuestion {
        return this._currentQuestion;
    }

    set currentQuestion(val: IUserQuestion) {
        this._currentQuestion = val;
    }

    constructor(public quizServices:QuizServices,
                public authentication:Authentication,
                public routeParams:RouterMod.RouteParams,
                public router:RouterMod.Router) {


    }

    ngOnInit() {
        this.testId = parseInt(this.routeParams.get('testId'));

        if (!this.authentication.authenticate()) {
            return;
        }

        this.name = this.authentication.user.username;
        this.readTest(this.testId);
    }

    previousQuestion() {
        var newIndex = this.currentQuestion.questionNumber - 2;
        this.currentQuestion = this.quiz.userQuestions[newIndex];
    }

    nextQuestion() {
        var newIndex = this.currentQuestion.questionNumber;
        if (newIndex < this.quiz.questionCount) {
            this.currentQuestion = this.quiz.userQuestions[newIndex];
        }
    }

    userChecked(index:number) : void {
        console.log(`User checked ${index}.`);
        var answer = this.currentQuestion.responsesShown[index];

        this.quizServices.recordAnswer(this.test.testId, this.currentQuestion.questionNumber, answer)
            .subscribe(res => {
                        console.log(res);
                        this.userAnswers[this.currentQuestion.questionNumber] = answer;

                        setTimeout(() => this.nextQuestion(), 500);
                    }
                    ,err => alert(err.msg || err));
    }

    getAnswerClass(index: number) {
        if (this.currentQuestion && this.currentQuestion.responsesShown[index] === this.userAnswers[this.currentQuestion.questionNumber]) {
            return 'selectedAnswer';
        }

        return '';
    }
    scoreTest() {
        this.quizServices.scoreTest(this.test.testId)
            .subscribe((scoringResult:IScoringResult) => {
                if (!scoringResult.testComplete) {
                    let msg = 'Please answer questions ' + scoringResult.missingAnswers.join(',');
                    alert(msg);
                    return;
                }

                this.router.navigateByUrl(`/quiz/test/${this.test.testId}/review`);
            }
            ,err => console.log(err));
    }

    private readTest(testId:number) {
        console.log(`Proctoring exam: testId = ${testId}`);

        this.quizServices.getTest(testId)
            .do(t => this.test = t)
            .flatMap(t => this.quizServices.getQuiz(t.quizId))

            .subscribe((q:IQuiz) => {
                console.log('Test corresponds to quiz:', q.quizId);
                this.quiz = q;
                this.currentQuestion = this.quiz.userQuestions[0];
                this.userAnswers = {};
                this.proctorState = ProctorState.PresentQuestion;

            }, err => console.log(err));
    }
}
