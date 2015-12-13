import {Component, NgFor} from 'angular2/angular2';
import {FORM_DIRECTIVES, NgClass} from 'angular2/angular2';
import {AnimalServices} from '../../services/AnimalServices';
import {IQuestion} from '../../common/interfaces/AnimalInterfaces';
import {AnimalList} from './AnimalList';
import {AnimalPlay} from './AnimalPlay';

var noQuestion:IQuestion = {
    questionId: 0,
    text: '',
    yes: 0,
    no: 0,
    isRoot: false
};

interface IModel {
    currentQuestion: IQuestion;
    latestLearnedAnimal:string;
    reloadAnimalList:boolean;
}

@Component({
    selector: 'animal-game',
    bindings: [AnimalServices],
    templateUrl: './components/animals/AnimalGame.html',
    directives: [FORM_DIRECTIVES, NgClass, NgFor, AnimalList, AnimalPlay],
    styleUrls: ['./components/animals/AnimalGame.css']
})
export class AnimalGame {

    model:IModel = {
        currentQuestion:noQuestion,
        latestLearnedAnimal: '',
        reloadAnimalList: false
    };

    constructor(public animalServices:AnimalServices) {
        console.log('Component AnimalGame constructed.');
        this.findLatestAnimal();
    }

    findLatestAnimal() {
        this.animalServices.getQuestions()
            .subscribe(questions => {
                var animals = questions.filter(q => q.yes === 0)
                                .sort((q1, q2) => q2.questionId - q1.questionId);
                if (animals.length > 0) {
                    this.model.latestLearnedAnimal = animals[0].text;
                }
            });
    }

    questionChanged(question:IQuestion) {
        this.model.currentQuestion = question;
    }

    dbUpdated(updateInfo:any[]) {
        this.model.latestLearnedAnimal = updateInfo[0].text;
        this.model.reloadAnimalList = true;     //Trigger child to reload
    }

    animalListReloaded() {
        this.model.reloadAnimalList = false;
    }
}