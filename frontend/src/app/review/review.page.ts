import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-review',
  templateUrl: './review.page.html',
  styleUrls: ['./review.page.scss'],
  standalone: false,
})
export class ReviewPage implements OnInit {
  profName: string = '';
  profAvatar: string = '';
  selectedRating: number = 0;
  commentText: string = '';
  imageError: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['profName']) this.profName = params['profName'];
      if (params['profAvatar']) this.profAvatar = params['profAvatar'];
    });
  }

  setRating(rating: number) {
    this.selectedRating = rating;
  }

  handleImageError(event: any) {
    this.imageError = true;
  }

  submitReview() {
    console.log('Review submitted:', {
      profName: this.profName,
      rating: this.selectedRating,
      comment: this.commentText
    });
    // Volvemos a home al terminar el flujo
    this.router.navigate(['/home']);
  }
}
